# syntax=docker/dockerfile:1

# Estágio 1: Build do React/Vite
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
# npm ci respeita o package-lock.json (build reproduzível) e usa cache entre builds
RUN npm ci 

COPY . .
RUN npm run build

# Estágio 2: Nginx (serve o front e repassa /api para o backend)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
