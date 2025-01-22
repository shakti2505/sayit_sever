FROM node:18-alpine

# Set environment to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Expose the application port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
