#include "header/serial.h"

int serial_open(const char *device, const int baudrate) {
    int fd = open(device, O_RDWR | O_NOCTTY | O_NDELAY);
    struct termios options;
    tcgetattr(fd, &options);
    cfsetispeed(&options, baudrate);
    cfsetospeed(&options, baudrate);

    options.c_cflag |= (CLOCAL | CREAD);
    tcsetattr(fd, TCSANOW, &options);

    if (fd == -1) {
        char error[55];
        sprintf(error, "open port: Unable to open %s", device);
        perror(error);
        return -1;
    } else {
        fcntl(fd, F_SETFL, 0);
    }

    return fd;
}

void serial_close(int fd) {
    close(fd);
}

int serial_write(int fd, const uint8_t data[9][8]) {
    int bytesWritten = 0;
    for(int i = 0; i < 9; i++){
        for(int j = 0; j < 8; j++){
            printf("%X ", data[i][j]);
        }
        printf("\n");
    }
    for (int i = 0; i < 9; i++) {
        int length = sizeof data[i];
        int n = write(fd, data[i], length);
        if (n < 0) {
            fputs("write() of 8 bytes failed!\n", stderr);
        }
        bytesWritten++;
    }
    return bytesWritten;
}


int serial_read(int fd, char *buffer, int buffer_size) {
    int bytes_read = read(fd, buffer, buffer_size - 1);
    if (bytes_read == -1) {
        perror("read");
        return -1;
    }
    buffer[bytes_read] = '\0'; // Null-terminate the string
    return bytes_read;
}
//
//int main(void) {
//    int fd = serial_open("/dev/ttyUSB0", B9600);
//    uint8_t data[9][8] = {{0xF2, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF},
//                          {0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00},
//                          {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00},
//                          {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00},
//                          {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00},
//                          {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00},
//                          {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00},
//                          {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00},
//                          {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00},
//    };
//    printf("%d\n", serial_write(fd, data));
//    close(fd);
//}
