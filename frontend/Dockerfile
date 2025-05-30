# Use Node.js 20
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose port 5173 for Vite development server
EXPOSE 5173

# Install Vite globally
RUN npm install -g vite

# Start the Vite development server
CMD ["vite", "--host", "0.0.0.0"]