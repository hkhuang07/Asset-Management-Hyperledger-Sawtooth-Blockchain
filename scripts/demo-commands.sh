#!/bin/bash
# Các lệnh demo chạy từ command line để thể hiện tính toàn vẹn (Immutability) và Phân tán
echo "Cài dặt key..."
docker exec -it validator-0 sawadm keygen

echo "Tạo một Asset qua CLI (IntegerKey Demo)..."
docker exec -it intkey-tp intkey set asset_1 100 --url http://rest-api-0:8008

echo "Kiểm tra giá trị ở cả 3 validator để chứng minh Decentralization..."
docker exec -it validator-0 curl http://rest-api-0:8008/state
docker exec -it validator-1 curl http://rest-api-1:8008/state
docker exec -it validator-2 curl http://rest-api-2:8008/state
