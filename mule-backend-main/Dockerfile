# ---------- 1) Builder stage ----------
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Install dependencies (only what's needed to build)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# ---------- 2) Runtime stage ----------
FROM node:20-alpine

# Create non-root user for security
#RUN addgroup -S nodejs && adduser -S node -G nodejs

WORKDIR /usr/src/app

# Copy only node_modules and app files from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app ./

# Ensure node:alpine has required native deps (if you use sharp/bcrypt etc.)
# RUN apk add --no-cache python3 make g++  # uncomment only if native modules are used
RUN apk update && apk add --no-cache tzdata
ENV TZ=Asia/Kolkata
RUN cp /usr/share/zoneinfo/Asia/Kolkata /etc/localtime && echo "Asia/Kolkata" > /etc/timezone

# Environment
ENV NODE_ENV=production \
    PORT=5000

# Expose app port
EXPOSE 5000

# Run as non-root
# USER node

# Start server
# If your entry file is different, change below (e.g., server.js or dist/server.js)
CMD [ "node", "server.js" ]