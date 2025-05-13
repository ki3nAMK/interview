# Interview Chat App

Một ứng dụng chat được xây dựng với kiến trúc microservice, sử dụng Docker, Redis, MongoDB và Node.js. Hướng dẫn này sẽ giúp bạn chạy ứng dụng ở môi trường local.

---

## 🧰 Yêu cầu trước khi bắt đầu

Trước khi chạy source code, hãy đảm bảo bạn đã cài đặt các công cụ sau:

- **Docker:** [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)  
- **Yarn:** [https://classic.yarnpkg.com/lang/en/docs/install](https://classic.yarnpkg.com/lang/en/docs/install)

---

## 🚀 Các bước để chạy ứng dụng local

### 1. Clone source code

```bash
git clone https://github.com/ki3nAMK/interview.git
cd interview
```

### 2. Tạo Docker network

```bash
docker network create --driver bridge chat_app_network
```

### 3. Khởi động Redis và MongoDB

```bash
docker compose -f docker-compose-redis.yml up -d
docker compose -f docker-compose-mongo.yml up -d
```

### 4. Cài đặt dependencies bằng Yarn

```bash
yarn install
```

### 5. Khởi động toàn bộ ứng dụng bằng Docker

```bash
docker compose up -d
```

## 🌐 Truy cập ứng dụng

Sau khi chạy thành công, bạn có thể truy cập vào các địa chỉ sau:

- **API chính:** http://localhost:8080  
- **Tài liệu Swagger:** http://localhost:8080/api/docs

---

## 📝 Ghi chú

- Kiểm tra các container Docker đang chạy:

```bash
docker ps
```

- Để dừng tất cả các dịch vụ đang chạy bằng Docker Compose, sử dụng lệnh sau:

```bash
docker compose down
```

- Nếu gặp lỗi kết nối hoặc xung đột cổng, bạn nên kiểm tra các mục sau:

  - Cấu hình trong file `.env` (nếu có)
  - Các cổng đã được sử dụng trong `docker-compose.yml`
  - Trạng thái các container bằng lệnh:

```bash
docker ps -a
```

## 📁 Cấu trúc thư mục

```
interview/
├── docker-compose.yml
├── docker-compose-redis.yml
├── docker-compose-mongo.yml
├── apps/
│   ├── gateway/
│   ├── auth/
│   └── ...
├── libs/
│   └── ...
└── README.md
```

## 👨‍💻 Người phát triển

Nguyễn Bá Hoàng Kiên
