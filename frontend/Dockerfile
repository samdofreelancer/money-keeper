FROM node:18-alpine

RUN apk add --no-cache curl netcat-openbsd

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build frontend with CI profile
RUN npm run build -- --mode ci

# Install serve to serve static files
RUN npm install -g serve

EXPOSE 5173

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 CMD nc -z localhost 5173 || exit 1

# Serve the built static files
CMD ["serve", "-s", "dist", "-l", "5173"]
