FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache yarn

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

CMD ["yarn", "start:prod"]