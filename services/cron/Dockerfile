FROM node:20-alpine

WORKDIR /app

COPY services/cron/package*.json ./

COPY @shared ./@shared

RUN npm install --omit=dev

COPY . .

CMD [ "npm", "run", "start" ]