FROM node:10-alpine

WORKDIR /app

WORKDIR /home/node/app

COPY . .

RUN npm install

CMD [ "npm", "build" ]
CMD [ "npm", "start" ]