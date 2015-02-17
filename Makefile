all: node

.PHONY: node run-server

node:
	cd node; docker build -t coliseu:2.0.0.b1 .

run-server:
	docker run -d -p 0.0.0.0:9000:9000 --link mongodb:mongodb coliseu:2.0.0.b1

start: run-server
