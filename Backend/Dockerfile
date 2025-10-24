# Stage 1: Base Node image
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: Install dependencies
FROM base AS dependencies
# Install production dependencies ONLY
RUN npm install --only=production
# If you have build steps (e.g., TypeScript), install all dependencies and build
# RUN npm install
# RUN npm run build --if-present

# Stage 3: Production image - copy only necessary files
FROM base AS production
# Copy installed node_modules from the dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
# Copy application code (including the src folder)
COPY . .

# Expose the port the app runs on (adjust if your app uses a different port)
EXPOSE 8000

# Command to run the application (using server.js as the entry point)
CMD ["node", "server.js"]