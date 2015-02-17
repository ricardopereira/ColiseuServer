FROM ubuntu:14.04
MAINTAINER Ricardo Pereira "m@ricardopereira.eu"

ENV DEBIAN_FRONTEND noninteractive

# Locale
RUN locale-gen en_US.UTF-8

# Update
RUN apt-get update
RUN apt-get update --fix-missing

# Base
RUN apt-get install -y --force-yes curl git openssl make python build-essential ca-certificates

# Node
RUN mkdir /nodejs && curl http://nodejs.org/dist/v0.12.0/node-v0.12.0-linux-x64.tar.gz | tar xvzf - -C /nodejs --strip-components=1
# Environment
ENV PATH $PATH:/nodejs/bin

# Extra - ffmpeg
ADD ./ffmpeg/ffmpeg.tar.gz /usr/local/
ADD ./ffmpeg/libc.conf /etc/ld.so.conf.d/

# Node packages
RUN npm install -g nodemon

WORKDIR /app
ADD package.json /app/
RUN npm install
ADD . /app

# Cleanup
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
RUN apt-get autoremove -y

# Check install
RUN node -v
RUN npm -v

# Production
ENV NODE_ENV production

# Listen on port
EXPOSE 9000

CMD []
ENTRYPOINT ["/nodejs/bin/npm", "start"]
