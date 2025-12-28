FROM node:18-alpine as builder

RUN apk add --no-cache curl netcat-openbsd

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Build frontend with CI profile - loads .env.ci which sets VITE_API_URL=/api
RUN npx vite build --mode ci

# Use nginx to serve frontend and proxy API requests to backend
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 CMD sh -c 'curl -f http://localhost:5173/ || exit 1'

CMD ["nginx", "-g", "daemon off;"]
