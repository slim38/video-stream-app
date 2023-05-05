FROM node:lts-alpine as builder

WORKDIR /usr/app

ENV VIDEO_DIR="./videos"

COPY package.json .
COPY package-lock.json .
COPY src .
COPY tsconfig.* .

RUN npm i
RUN npm run build
RUN npm prune --production

FROM node:lts-alpine

WORKDIR /usr/app

ENV VIDEO_DIR="./videos"

COPY --from=builder \
    /usr/app/dist/ \
    /usr/app/dist

COPY --from=builder \
    /usr/app/node_modules/ \
    /usr/app/node_modules

RUN mkdir /usr/app/videos

EXPOSE 3000
CMD ["node", "dist/main.js"]