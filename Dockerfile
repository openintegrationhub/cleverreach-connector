FROM node:12-alpine
LABEL NAME="cleverreach-connector"
LABEL MAINTAINER Johannes Knoop "jknoop@wice.de"
LABEL SUMMARY="This image is used to start the CleverReach Connector for OIH"

RUN apk --no-cache add \
    python \
    make \
    g++ \
    libc6-compat

WORKDIR /usr/src/app

COPY package.json /usr/src/app

RUN npm install --production

COPY . /usr/src/app

RUN chown -R node:node .

USER node

ENTRYPOINT ["npm", "start"]
