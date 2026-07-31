# ==========================================
# Stage 1: Build the Angular 16 application
# ==========================================
FROM node:18-alpine AS build
WORKDIR /app

# Copy dependency files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build for production (output: dist/hotel-pos-frontend)
RUN npx ng build --configuration=production

# ==========================================
# Stage 2: Serve the application with Nginx
# ==========================================
FROM nginx:alpine

# Copy the built application from the previous stage
COPY --from=build /app/dist/hotel-pos-frontend /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]