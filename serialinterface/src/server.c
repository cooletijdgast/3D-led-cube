/**
 * webserver.c -- A webserver written in C
 * 
 * Test with curl (if you don't have it, install it):
 * 
 *    curl -D - http://localhost:3490/
 *    curl -D - http://localhost:3490/d20
 *    curl -D - http://localhost:3490/date
 * 
 * You can also test the above URLs in your browser! They should work!
 * 
 * Posting Data:
 * 
 *    curl -D - -X POST -H 'Content-Type: text/plain' -d 'Hello, sample data!' http://localhost:3490/save
 * 
 * (Posting data is harder to test from a browser.)
 */

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <errno.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netdb.h>
#include <arpa/inet.h>
#include <time.h>
#include <sys/file.h>
#include <fcntl.h>
#include "header/net.h"
#include "header/file.h"
#include "header/mime.h"
#include "header/cache.h"
#include "header/serial.h"

#define PORT "3490"  // the port users will be connecting to

#define SERVER_FILES "./serverfiles"
#define SERVER_ROOT "./serverroot"

/**
 * Send an HTTP response
 *
 * header:       "HTTP/1.1 404 NOT FOUND" or "HTTP/1.1 200 OK", etc.
 * content_type: "text/plain", etc.
 * body:         the data to send.
 * 
 * Return the value from the send() function.
 */
int send_response(int fd, char *header, char *content_type, void *body, int content_length, int onlyHeaders) {
    const int max_response_size = 262144;
    char response[max_response_size];

    char currentTime[64]; // Array to store formatted time string
    time_t rawtime;
    struct tm *timeinfo;
    time(&rawtime);
    timeinfo = localtime(&rawtime);
    strftime(currentTime, sizeof(currentTime), "%a, %d %b %Y %T %Z", timeinfo); // Format time

    char connection[] = "Connection: Close";

    // Build HTTP response and store it in response

    int response_length = 0;
    if (onlyHeaders == 1) {
        response_length = sprintf(response, "%s", header);
    } else {
        response_length = sprintf(response, "%s\n%s\n%s\nContent-Length: %d\nContent-Type: %s\n\n%s", header,
                                  currentTime,
                                  connection,
                                  content_length, content_type, (char *) body);
    }
    // Send it all!
    int rv = send(fd, response, response_length, 0);

    if (rv < 0) {
        perror("send");
    }
    printf("response %s\n", response);
    return rv;
}


/**
 * Send a /d20 endpoint response
 */
//void get_d20(int fd) {
//    // Generate a random number between 1 and 20 inclusive
//
//    ///////////////////
//    // IMPLEMENT ME! //
//    ///////////////////
//
//    // Use send_response() to send it back as text/plain data
//
//    ///////////////////
//    // IMPLEMENT ME! //
//    ///////////////////
//}

/**
 * Send a 404 response
 */
void response404(int fd) {
    char filepath[4096];
    struct file_data *filedata;
    char *mime_type;

    // Fetch the 404.html file
    snprintf(filepath, sizeof filepath, "%s/404.html", SERVER_FILES);
    filedata = file_load(filepath);

    if (filedata == NULL) {
        // TODO: make this non-fatal
        fprintf(stderr, "cannot find system 404 file\n");
        exit(3);
    }

    mime_type = mime_type_get(filepath);

    send_response(fd, "HTTP/1.1 404 NOT FOUND", mime_type, filedata->data, filedata->size, 0);
    file_free(filedata);
}

/**
 * Read and return a file from disk or cache
 */
struct file_data *get_file(char *request_path) {
    ///////////////////
    // IMPLEMENT ME! //
    ///////////////////

    char filepath[4096];
    struct file_data *filedata;

    // Fetch the requested file
    snprintf(filepath, sizeof filepath, "%s", request_path);
    filedata = file_load(filepath);

    if (filedata == NULL) {
        // TODO: make this non-fatal
        fprintf(stderr, "cannot find %s file\n", request_path);
        exit(3);
    }
    return filedata;
}


char *replaceString(char *body, char *replacement, char *with) {
    char *result; // the return string
    char *ins;    // the next insert point
    char *tmp;    // varies
    int lengthOfReplacement;  // length of rep (the string to remove)
    int lengthOfNewString; // length of with (the string to replace rep with)
    int len_front; // distance between rep and end of last rep
    int count;    // number of replacements

    // sanity checks and initialization
    if (!body || !replacement)
        return NULL;
    lengthOfReplacement = strlen(replacement);
    if (lengthOfReplacement == 0)
        return NULL; // empty rep causes infinite loop during count
    if (!with)
        with = "";
    lengthOfNewString = strlen(with);

    // count the number of replacements needed
    ins = body;
    for (count = 0; tmp = strstr(ins, replacement); ++count) {
        ins = tmp + lengthOfReplacement;
    }

    tmp = result = malloc(strlen(body) + (lengthOfNewString - lengthOfReplacement) * count + 1);

    if (!result)
        return NULL;

    // first time through the loop, all the variable are set correctly
    // from here on,
    //    tmp points to the end of the result string
    //    ins points to the next occurrence of rep in orig
    //    orig points to the remainder of orig after "end of rep"
    while (count--) {
        ins = strstr(body, replacement);
        len_front = ins - body;
        tmp = strncpy(tmp, body, len_front) + len_front;
        tmp = strcpy(tmp, with) + lengthOfNewString;
        body += len_front + lengthOfReplacement; // move to next "end of rep"
    }
    strcpy(tmp, body);

    return result;
}


/**
 * Search for the end of the HTTP header
 * 
 * "Newlines" in HTTP can be \r\n (carriage return followed by newline) or \n
 * (newline) or \r (carriage return).
 */
char *getStartOfBody(char header[65536]) {
    for (int i = 0; header[i] != '\0'; i++) {
        if (header[i] == '\n' && header[i - 1] == '\r' && header[i - 2] == '\n' && header[i - 3] == '\r') {
            return &header[i + 1];
        }
    }
}

/**
 * Handle HTTP request and send response
 */
void handle_http_request(int fd) {
    const int request_buffer_size = 65536; // 64K
    char request[request_buffer_size];

    // Read request
    int bytes_recvd = recv(fd, request, request_buffer_size - 1, 0);

    if (bytes_recvd < 0) {
        perror("recv");
        return;
    }
    char httpMethod[4], httpPath[60];

    sscanf(request, "%s%s", httpMethod, httpPath);

    if (strcmp("OPTI/", httpMethod) == 0) {
        send_response(fd,
                      "HTTP/1.1 204 No Content\nAccept: text/html,application/json\nAccess-Control-Allow-Origin: *\nAccess-Control-Request-Method: POST\nAccess-Control-Allow-Headers: *\n",
                      NULL, NULL, NULL, 1);
    } else if (strcmp("GET", httpMethod) == 0) {
        struct file_data *index = get_file("serverroot/index.html");
        send_response(fd, "HTTP/1.1 200 OK", "text/html", index->data, index->size, 0);
    } else if (strcmp("POST/", httpMethod) == 0) {
        if (strcmp("/", httpPath) == 0) {
            send_response(fd, "HTTP/1.1 204 No Content\nAccess-Control-Allow-Origin: *", NULL, NULL, NULL, 1);
            char *body = getStartOfBody(request);
            body = replaceString(body, "\"", "");
            body = replaceString(body, "{b:", "");
            body = replaceString(body, "}", "");

            int fd = serial_open("/dev/ttyUSB0", B9600);
            uint8_t data[9][8] = {0};
            int rowCounter = 0;
            int colCounter = 0;
            char *hexNumber = NULL;
            hexNumber = malloc(sizeof(char) * 3);
            hexNumber[0] = '\0';
            while (*body != '\0') {
//                if(body[0] == '['){
//                    *hexNumber = 0;
//                }
                if (body[0] == ',' && body[0 + 1] != '[') {
                    sscanf(hexNumber, "%hhX", &data[rowCounter][colCounter]);
                    colCounter++;
                    *hexNumber = 0;
                } else {
                    if (body[0] != '[' && body[0] != '{' && body[0] != '}' && body[0] != ']' && body[0] != ',') {
                        sprintf(hexNumber, "%s%c", hexNumber, body[0]);
                    }
                }
                if (body[0] == ']') {
                    sscanf(hexNumber, "%hhX", &data[rowCounter][colCounter]);
                    rowCounter++;
                    colCounter = 0;
                    *hexNumber = 0;
                }
                body++;
            }
            serial_write(fd, data);
            serial_close(fd);
            free(hexNumber);
        }
    } else {
        response404(fd);
    }
}

/**
 * Main
 */
int main(void) {
    int newfd;  // listen on sock_fd, new connection on newfd
    struct sockaddr_storage their_addr; // connector's address information
    char s[INET6_ADDRSTRLEN];

//    struct cache *cache = cache_create(10, 0);

    // Get a listening socket
    int listenfd = get_listener_socket(PORT);

    if (listenfd < 0) {
        fprintf(stderr, "webserver: fatal error getting listening socket\n");
        exit(1);
    }

    printf("webserver: waiting for connections on port %s...\n", PORT);

    // This is the main loop that accepts incoming connections and
    // responds to the request. The main parent process
    // then goes back to waiting for new connections.

    while (1) {
        socklen_t sin_size = sizeof their_addr;

        // Parent process will block on the accept() call until someone
        // makes a new connection:
        newfd = accept(listenfd, (struct sockaddr *) &their_addr, &sin_size);
        if (newfd == -1) {
            perror("accept");
            continue;
        }

        // Print out a message that we got the connection
        inet_ntop(their_addr.ss_family,
                  get_in_addr((struct sockaddr *) &their_addr),
                  s, sizeof s);
        printf("server: got connection from %s\n", s);

        // newfd is a new socket descriptor for the new connection.
        // listenfd is still listening for new connections.

        handle_http_request(newfd);

        close(newfd);
    }

    // Unreachable code

    return 0;
}

