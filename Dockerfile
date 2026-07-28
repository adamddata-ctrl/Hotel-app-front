# ==========================================
# Stage 1: Build the Angular 16 application
# ==========================================
FROM node:18-alpine AS build
WORKDIR /app

# Copy dependency mappings and install clean packages
COPY package*.json ./
RUN npm install

# Copy the rest of your updated code files into the container
COPY . .

# Compile using your strict production mapping profiles
RUN npx ng build --configuration=production

# ==========================================
# Stage 2: Serve the application using Nginx
# ==========================================
FROM nginx:alpine

# ✅ THE CRITICAL FIX: Copies your production files directly from your configured build directory layout
COPY --from=build /app/dist/hotel-pos-frontend /usr/share/nginx/html

# Link your custom internal SPA routing rules
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]