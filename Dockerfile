FROM node:16.15.0-alpine

ARG APP_PASSWORD
ARG USER_GMAIL
ARG FACEBOOK_APP_SECRET
ARG FACEBOOK_APP_ID
ARG TOKEN_KEY

ENV APP_PASSWORD="ltsf ospt rids foar"
ENV USER_GMAIL="westartem71@gmail.com"
ENV FACEBOOK_APP_ID="3482259702097118"
ENV FACEBOOK_APP_SECRET='7979f69aae6ba725582ca648dc79101d'
ENV TOKEN_KEY='uefvQRLbVhQ3CxgPPwS6dq4tw1oofcq385yOrGKctD4llcuJjJ00uJ3MX+K8Ki85JGhuUbSXFfdZWuEo/LmE3PkdFPnhhSl8ui33jHGuqTgjKl+sPa5i0WsUFTM0RG3+Szt7HfExds2RkRFUrdfAHmhQixIdnLoaLcOal+Ajrodlnmrul3wNRRgT4Cp2yugn9gTnVAlAdDb2mVMKdAfWR9MEycaIuQlO8ry/s1s0/BeGPfxFqqLzkruqC19zHjYg/0CUGwCBi9NWllKg5D5QfGU/gcVwa1mc746AthYlJ6gcln07xW5MALk72UHlUMR4LuaMSmDFmmL2h0zdAKl08g=='

RUN npm i -g npm
RUN mkdir -p /src/app/
COPY ./package.json ./package-lock.json /src/app/
WORKDIR /src/app/
RUN npm i --production
COPY ./ /src/app/

ENV NODE_ENV='prod'
CMD ["npm", "start"]