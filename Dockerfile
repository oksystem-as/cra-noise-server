FROM mhart/alpine-node:6.7.0

RUN mkdir -p /usr/src/iot-lora-cra-cache
WORKDIR /usr/src/iot-lora-cra-cache

RUN ls -l
COPY ./ /usr/src/iot-lora-cra-cache
RUN rm Dockerfile
RUN ls -l

RUN npm install --production

EXPOSE 8080
CMD [ "npm", "start" ]