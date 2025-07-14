FROM node:20-alpine

WORKDIR /app

COPY services/worker/package*.json ./

COPY @shared ./@shared

RUN npm install --omit=dev

COPY . .

CMD [ "npm", "run", "start" ]