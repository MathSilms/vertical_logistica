# Dockerfile – build final image
FROM node:23-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm install --production && npm cache clean --force

COPY . .

RUN npx tsc

EXPOSE 3000
CMD ["node", "dist/server.js"]