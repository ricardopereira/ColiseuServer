# FFMPEG insert into blank Debian to minimze image size

FROM debian:wheezy
MAINTAINER Nachochip <blockchaincolony@gmail.com>

ADD 	ffmpeg.tar.gz	/usr/local/
ADD 	libc.conf 	/etc/ld.so.conf.d/

CMD           ["--help"]
ENTRYPOINT    ["ffmpeg"]
