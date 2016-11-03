FROM mhart/alpine-node:6.7.0

RUN apk add --no-cache tzdata
RUN cp /usr/share/zoneinfo/Europe/Prague /etc/localtime
RUN echo "Europe/Prague" > /etc/timezone
RUN apk del tzdata

RUN mkdir -p /usr/src/cra-noise-server
WORKDIR /usr/src/cra-noise-server

RUN ls -l
COPY ./ /usr/src/cra-noise-server
RUN rm Dockerfile
RUN ls -l

RUN npm install --production

EXPOSE 8080
CMD [ "npm", "start" ]