FROM node:16.15.0-alpine
RUN npm i -g npm
RUN mkdir -p /src/app/
COPY ./package.json ./package-lock.json /src/app/
WORKDIR /src/app/
RUN npm i --production
COPY ./ /src/app/

ENV NODE_ENV='prod'
CMD ["npm", "start"]