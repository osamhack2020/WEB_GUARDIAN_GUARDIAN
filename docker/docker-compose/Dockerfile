FROM node:latest

#app directory
WORKDIR /usr/src/app

#package.josn and package-lock.josn
COPY package*.json ./
COPY logo128.png ./logo128.png

RUN npm install

#app source

COPY . .

EXPOSE 3000
CMD ["npm", "start"]