FROM node:20-alpine

WORKDIR /app

COPY services/job-management/package*.json ./

COPY @shared ./@shared

RUN npm install --omit=dev

COPY . .

CMD [ "npm", "run", "start" ]