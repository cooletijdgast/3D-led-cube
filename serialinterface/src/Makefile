CC=gcc
CFLAGS=-Wall -Wextra

OBJS=server.o net.o file.o mime.o cache.o hashtable.o llist.o ../../serialTest/serial.o

all: server

server: $(OBJS)
	gcc -o $@ $^

net.o: net.c header/net.h

server.o: server.c header/net.h

file.o: file.c header/file.h

mime.o: mime.c header/mime.h

cache.o: cache.c header/cache.h

hashtable.o: hashtable.c header/hashtable.h

llist.o: llist.c header/llist.h

serial.o: serial.c header/serial.h

clean:
	rm -f $(OBJS)
	rm -f server
	rm -f cache_tests/cache_tests
	rm -f cache_tests/cache_tests.exe
	rm -f cache_tests/cache_tests.log

TEST_SRC=$(wildcard cache_tests/*_tests.c)
TESTS=$(patsubst %.c,%,$(TEST_SRC))

cache_tests/cache_tests:
	cc cache_tests/cache_tests.c cache.c hashtable.c llist.c -o cache_tests/cache_tests

test:
	tests

tests: clean $(TESTS)
	sh ./cache_tests/runtests.sh

.PHONY: all, clean, tests
