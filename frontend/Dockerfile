# Stage 1: Build
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy mã nguồn
COPY . .

# Build ứng dụng (Vite sẽ tạo folder dist)
RUN npm run build

# Stage 2: Serve với Nginx
FROM nginx:stable-alpine

# Copy file config Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output từ stage 1 vào thư mục phục vụ của nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
