# Build stage
FROM node:20.12.2-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx vite build --mode ci

# Production stage
FROM nginx:alpine AS production

# Copy build output to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 CMD wget -q --spider http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]
