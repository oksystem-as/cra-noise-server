FROM mhart/alpine-node:6.7.0

RUN mkdir -p /usr/src/cra-noise-server
WORKDIR /usr/src/cra-noise-server

RUN ls -l
COPY ./ /usr/src/cra-noise-server
RUN rm Dockerfile
RUN ls -l

RUN npm install
RUN npm run grunt

EXPOSE 8080
CMD [ "npm", "start" ]