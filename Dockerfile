FROM node:20-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY start.sh /app

# Copy package.json files for both backend and frontend
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies for backend and frontend
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build the frontend app
RUN cd frontend && npm run build

# Expose ports for backend and frontend
EXPOSE 3000 5173


RUN chmod +x /app/start.sh

# Use the startup script as the entrypoint
ENTRYPOINT ["/bin/sh", "/app/start.sh"]