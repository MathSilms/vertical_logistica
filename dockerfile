FROM node:23-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx tsc && echo "✅ Build concluído" && ls -la dist || (echo '❌ Falha ao compilar' && exit 1)

FROM node:23-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --production && npm cache clean --force

EXPOSE 3000
CMD ["node", "dist/server.js"]
