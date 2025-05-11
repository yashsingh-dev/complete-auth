# Stage 1: Build the frontend
FROM node:22.13.1 as build

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Build the app for production
RUN npm run build

# Stage 2: Serve the production build with 'serve'
FROM node:22.13.1 as serve

# Set the working directory
WORKDIR /app

# Install 'serve' to serve the static files
RUN npm install -g serve

# Copy the build from the build stage
COPY --from=build /app/dist /app/dist

# Expose the port that serve will run on
EXPOSE 5173

# Command to serve the app
CMD ["serve", "-s", "dist", "-l", "5173"]
