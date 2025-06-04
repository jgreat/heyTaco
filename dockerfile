FROM node:14.1.0

WORKDIR /app
COPY yarn.lock package.json ./

RUN yarn install
COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
