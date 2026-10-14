# syntax=docker/dockerfile:1
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
# Se o bcrypt falhar ao instalar no Alpine, descomente a linha abaixo (antes do npm ci):
# RUN apk add --no-cache python3 make g++
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

COPY . .

EXPOSE 3000
USER node
CMD ["node", "app.js"]
