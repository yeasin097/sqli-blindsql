# Use Node.js 20
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose port 3000 for the backend server
EXPOSE 3000

# Start the backend server
CMD ["node", "server.js"]