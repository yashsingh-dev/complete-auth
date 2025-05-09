# 1. Use official Node.js base image
FROM node:22.13.1

# 2. Set working directory inside container
WORKDIR /app

# 3. Copy only package files first (for better caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy rest of the application code
COPY . .

# 6. Expose port your server listens on (optional but good)
EXPOSE 3000

# 7. Start the app
CMD ["npm", "run", "dev"]
