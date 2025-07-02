# Build stage
FROM node:20.12.2-alpine AS build

RUN apk add --no-cache curl netcat-openbsd

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Build frontend with CI profile (skip vue-tsc to avoid js emit error)
RUN npx vite build --mode ci

# Production stage
FROM nginx:alpine AS production

WORKDIR /usr/share/nginx/html

# Remove unnecessary packages and use nginx to serve static files

COPY --from=build /app/dist .

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 CMD wget -q --spider http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]
