# Stage 1: Build the Angular 16 application
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx ng build --configuration=production

# Stage 2: Serve the application using Nginx
FROM nginx:alpine
# ✅ MATCHING FIX: Point to the accurate project folder name output from your local project settings
#COPY --from=build /app/dist/hotelpos /usr/share/nginx/html

# To exactly this:
COPY --from=build /app/dist/hotelpos/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]