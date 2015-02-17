# Coliseu 2.0 b1

Build image with:

    make node

Run:

    make start


# Install MongoDB

This container needs MongoDB:

    docker pull dockerfile/mongodb

Running MongoDB:

    docker run -d -p 27017:27017 -v /srv/db/:/data/db --name mongodb dockerfile/mongodb

Access MongoDB collections:

    docker run -it --rm --link mongodb:mongodb dockerfile/mongodb bash -c 'mongo --host mongodb'
