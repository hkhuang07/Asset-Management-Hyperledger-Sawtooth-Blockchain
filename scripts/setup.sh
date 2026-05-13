#!/bin/bash
echo "=== THIẾT LẬP ĐỒ ÁN HYPERLEDGER SAWTOOTH ==="
echo "[1] Cập nhật dependencies (NPM)..."
cd frontend && npm install
cd ../backend && npm install
cd ..

echo "[2] Khởi chạy mạng lưới Sawtooth (3 Validators, TPs) bằng Docker Compose..."
docker-compose up -d

echo "[3] Vui lòng chạy frontend (npm run dev) và backend (npm start) ở các terminal riêng để trải nghiệm!"
echo "Done!"
