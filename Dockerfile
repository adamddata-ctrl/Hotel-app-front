# Stage 1: Build the Angular app
FROM node:18-alpine AS build
WORKDIR /app

# Force a clean install and cache-bust
COPY package*.json ./
RUN npm cache clean --force && npm install

# Copy the source code
COPY . .

# 🔥 CACHE-BUSTER: This forces Angular to recompile every single time
RUN echo "Force rebuild: $(date)" && npx ng build --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove any default files just in case
RUN rm -rf /usr/share/nginx/html/*

# Copy the new built app and new config
COPY --from=build /app/dist/hotel-pos-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]