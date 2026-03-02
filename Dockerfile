FROM node:20-alpine

WORKDIR /app

# Install dependencies for sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Create data directory for SQLite
RUN mkdir -p /app/data

# Expose nothing (bot connects outbound)
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]