# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# --- Add ARG declarations ---
ARG VITE_BACKEND_HOST
ARG VITE_GOOGLE_CLIENT_KEY
ARG VITE_APP_ENV=production # Default to production if not passed

COPY package*.json ./
RUN npm install
COPY . .

# --- Use ARG in the build command ---
# Pass ARGs as environment variables ONLY for the build command
RUN VITE_BACKEND_HOST=${VITE_BACKEND_HOST} \
    VITE_GOOGLE_CLIENT_KEY=${VITE_GOOGLE_CLIENT_KEY} \
    VITE_APP_ENV=${VITE_APP_ENV} \
    npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]