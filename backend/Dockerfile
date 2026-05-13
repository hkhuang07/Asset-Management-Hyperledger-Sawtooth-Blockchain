FROM node:12-buster-slim

# Cho phép npm chạy scripts với quyền root (cần thiết cho native modules)
RUN npm config set unsafe-perm true

# Sửa lỗi Debian Buster EOL (End of Life) bằng cách chuyển sang repository lưu trữ
RUN sed -i 's/deb.debian.org/archive.debian.org/g' /etc/apt/sources.list && \
    sed -i 's|security.debian.org/debian-security|archive.debian.org/debian-security|g' /etc/apt/sources.list && \
    sed -i '/buster-updates/d' /etc/apt/sources.list

# Cài đặt các công cụ cần thiết để biên dịch zeromq và sawtooth-sdk
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    pkg-config \
    libzmq3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Chỉ copy package files trước để tận dụng Docker cache
COPY package*.json ./

# Cài đặt dependencies (lúc này zeromq sẽ được build thành công trên Linux)
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

EXPOSE 3001

# Chạy backend
CMD ["npm", "start"]
