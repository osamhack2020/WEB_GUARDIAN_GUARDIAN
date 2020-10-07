FROM node:latest

#app directory
WORKDIR /usr/src/app

#package.josn and package-lock.josn
COPY /home/codespace/workspace/WEB_GUARDIAN_GUARDIAN/package*.json ./

RUN npm install

#app source

COPY . .

EXPOSE 3000
CMD ["npm", "start-node"]