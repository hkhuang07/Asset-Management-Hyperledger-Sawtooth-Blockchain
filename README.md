# 🛡️ Hyperledger Sawtooth Asset Management

Hệ thống quản lý tài sản doanh nghiệp được xây dựng trên nền tảng **Hyperledger Sawtooth**, giải quyết các bài toán về tính minh bạch, bảo mật, và khả năng mở rộng của mạng Blockchain phân tán.

Dự án này được thiết kế để **trực quan hóa các khái niệm Blockchain cốt lõi** như: Tính bất biến (Immutability), Phân tán (Decentralization), Thực thi song song (Parallel Scheduling) và Tách biệt logic nghiệp vụ (Separation of Application Domain).

---

## 🏗️ Kiến trúc Hệ thống

- **Blockchain Core (Validator & Consensus)**: Chạy trên Docker với thuật toán đồng thuận **Devmode**. Bao gồm Validator, REST API.
- **Transaction Processors (Ứng dụng)**: 
  - `Asset-TP` (Python): Xử lý logic nghiệp vụ tài sản (Tạo mới, Chuyển nhượng).
  - `Settings-TP`: Quản lý cấu hình mạng lưới.
- **Backend (Node.js)**: Kết nối với Sawtooth qua REST API để đọc trạng thái và kết nối **ZeroMQ (ZMQ)** trực tiếp vào Validator để bắt sự kiện (Event Subscriptions) theo thời gian thực.
- **Frontend (React.js + TailwindCSS)**: Giao diện người dùng hiện đại, kết nối qua WebSocket tới Backend để cập nhật UI ngay lập tức khi có block mới.

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Yêu cầu hệ thống
- **Docker & Docker Compose** (Phiên bản mới nhất khuyên dùng).
- **WSL2** (nếu bạn sử dụng Windows). Khuyên dùng chạy Docker bên trong WSL Ubuntu.

### 2. Cấu hình Môi trường (Cực kỳ quan trọng cho WSL/Windows)

Frontend React.js chạy trên trình duyệt (ở máy host Windows) cần gọi API tới Backend (nằm trong container Docker của WSL). Để tránh lỗi kết nối, bạn cần khai báo địa chỉ IP của máy WSL.

1. Bật Terminal WSL Ubuntu lên và gõ lệnh: `ip addr show eth0` (hoặc `hostname -I`) để lấy địa chỉ IP của WSL (Ví dụ: `172.20.62.104`).
2. Mở file `frontend/.env` (tạo mới nếu chưa có) và nhập địa chỉ IP đó vào:
   ```env
   VITE_API_URL=http://172.20.62.104:3001
   ```
*(Lưu ý: Nếu bạn chạy thẳng trên Linux hoặc macOS không qua WSL ảo hóa, bạn có thể để `http://localhost:3001`)*

### 3. Khởi động toàn bộ hệ thống (One-Click Deployment)
Hệ thống đã được container hóa hoàn toàn, cho phép bạn khởi động tất cả dịch vụ chỉ với một lệnh:

```bash
# Di chuyển vào thư mục dự án
cd hyperledger-sawtooth-asset-management

# Build và khởi chạy tất cả các dịch vụ (Validator, Backend, Frontend...)
docker-compose up -d --build
```

### 4. Truy cập các thành phần
Sau khi lệnh hoàn tất, hệ thống sẽ sẵn sàng tại:
*   **Frontend Dashboard**: `http://localhost:8080` (Giao diện chính)
*   **Backend API**: `http://localhost:3001`
*   **Sawtooth REST API**: `http://localhost:8008`

---

## 🔍 Tính năng Nổi bật & Cách Demo

Sau khi truy cập vào **Frontend Dashboard (`http://localhost:8080`)**:

1. **Khởi tạo Định danh (Key Management)**:
   - Truy cập tab *Key Management* để tạo một cặp khóa Private/Public Key. Đây là danh tính hợp lệ duy nhất giúp bạn ký các giao dịch (Smart Contract security).
2. **Quản lý Tài sản (Asset Manager)**:
   - Tạo mới các tài sản số. Nhờ tích hợp **ZeroMQ Event**, ngay khi bạn submit, giao dịch sẽ được đưa vào Validator và hiển thị lên màn hình gần như tức thì, không có độ trễ (hết lỗi PENDING).
3. **Mô phỏng Tính Bất biến (Blockchain Explorer)**:
   - Truy cập tab *Explorer* để xem danh sách Block. Nhấn nút **Simulate Attack** để xem mô phỏng hệ thống phát hiện sự can thiệp dữ liệu: Một mã Hash bị thay đổi sẽ phá vỡ toàn bộ chuỗi `PREV_HASH` phía sau nó.
4. **Thử nghiệm Thực thi Song song (Performance Test)**:
   - Sawtooth cho phép xử lý giao dịch song song (Parallel Scheduling) - một điểm mạnh vượt trội so với các blockchain khác.
   - Tại tab *Performance*, bạn có thể giả lập bắn hàng loạt giao dịch tới Backend ở 2 chế độ: **Parallel** (sửa các tài sản khác nhau) và **Sequential** (sửa cùng 1 tài sản). So sánh thời gian thực thi để thấy sự khác biệt về hiệu năng.
5. **Kiến trúc & Các Transaction Families (Architecture & Families)**:
   - Xem các tab kiến trúc để hiểu cách hệ thống phân tách Core và App Domain, cũng như ý nghĩa của các Transaction Processor mặc định.

---

## 🛠️ Giải quyết sự cố thường gặp (Troubleshooting)

| Vấn đề | Nguyên nhân | Giải pháp |
| :--- | :--- | :--- |
| **Giao diện cứ xoay Loading ở Dashboard** | Chưa tạo Key Identity | Vào tab Key Management để tạo định danh. |
| **Bắn giao dịch bị PENDING / Không hiện lên UI** | Frontend đang gọi sai API | Kiểm tra file `frontend/.env` xem `VITE_API_URL` có đúng với IP máy WSL không. Cần build lại frontend nếu đổi env. |
| **Lỗi GPG Keyserver khi Build Docker TP** | Chặn mạng nội bộ | Đã được khắc phục trong Dockerfile sử dụng Python pip install trực tiếp thay vì apt-get package cũ của Sawtooth. |

---

## 🧑‍💻 Câu lệnh Kiểm tra Container (Từ Terminal)

**Xem danh sách các Block trực tiếp từ Core:**
```bash
docker exec -it sawtooth-validator sawtooth block list --url http://rest-api:8008
```

**Xem trạng thái các Transaction Processor (TP) đã kết nối:**
```bash
docker exec -it sawtooth-validator sawtooth status --url http://rest-api:8008
```

**Đọc Log của Backend để xem ZMQ Events:**
```bash
docker logs -f sawtooth-backend
```
