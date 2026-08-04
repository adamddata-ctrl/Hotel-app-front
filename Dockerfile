# Stage 1: Build the Angular 16 application
FROM node:18-alpine AS build
WORKDIR /app

# Copy dependency files and install dependencies
COPY package*.json ./

# 🔥 FORCE CLEAN INSTALL: This prevents the old node_modules from being reused
RUN npm cache clean --force && npm install

# 🔥 LAYER CACHE BUSTER: Forces Docker to forget the old source code timestamps
RUN echo "Force source copy: $(date)"
COPY . .

# 🔥 ANGULAR CACHE BUSTER: Forces a full, uncached recompilation
RUN echo "Force rebuild: $(date)" && npx ng build --configuration=production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built application from the previous stage
COPY --from=build /app/dist/hotel-pos-frontend /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]