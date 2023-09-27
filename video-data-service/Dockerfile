FROM node:lts-alpine as builder

WORKDIR /usr/app

#COPY package.json .
#COPY package-lock.json .
#COPY src .
#COPY tsconfig.* .
#COPY prisma ./prisma
COPY . .

RUN npm i
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

FROM node:lts-alpine

WORKDIR /usr/app

COPY --from=builder \
    /usr/app/dist/ \
    /usr/app/dist

COPY --from=builder \
    /usr/app/node_modules/ \
    /usr/app/node_modules

EXPOSE 3000
CMD ["node", "dist/main.js"]