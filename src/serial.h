// serial.h
#ifndef SERIAL_H
#define SERIAL_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <termios.h>
#include <stdint.h>
#include <errno.h>

int serial_open(const char *device, int baudrate);
void serial_close(int fd);
int serial_write(int fd, const uint8_t data[9][8]);
int serial_read(int fd, char *buffer, int buffer_size);

#endif // SERIAL_H
