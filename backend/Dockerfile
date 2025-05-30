# Use Node.js 18 for compatibility with Vite and React
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
EXPOSE 3000

# Start the Vite development server
CMD ["npm", "start"]