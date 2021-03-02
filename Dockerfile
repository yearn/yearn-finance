FROM node:erbium

RUN mkdir -p /app/yearn-finance
WORKDIR /app/yearn-finance
ADD . /app/yearn-finance
RUN yarn install

ENTRYPOINT ["yarn", "dev"]
