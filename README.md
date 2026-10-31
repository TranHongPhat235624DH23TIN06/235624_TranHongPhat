# Hệ thống quản lý thiết bị phòng học trên nền tảng đám mây

Sinh viên: Trần Hồng Phát - MSSV: 235624

## Mô tả đề tài
Ứng dụng quản lý thiết bị phòng học gồm frontend, backend API và cơ sở dữ liệu MongoDB Atlas. Hệ thống hỗ trợ thêm, xem, tìm kiếm, cập nhật, xóa thiết bị và theo dõi tình trạng sử dụng.

## Công nghệ sử dụng
- Frontend: React
- Backend: Node.js, Express
- Cơ sở dữ liệu: MongoDB Atlas
- Đóng gói: Docker, Docker Hub
- Triển khai: Render
- Quản lý mã nguồn: Git, GitHub

## Cấu trúc dự án
```
235624_TranHongPhat/
├── frontend/   # Giao diện React
├── backend/    # API Node.js + Express
└── README.md
```

## Hướng dẫn cài đặt và chạy chương trình
1. Clone repository:
   `git clone https://github.com/TranHongPhat235624DH23TIN06/235624_TranHongPhat.git`
2. Chạy backend:
   - `cd backend`
   - `npm install`
   - Tạo file `.env` theo mẫu `.env.example`
   - `npm start`
3. Chạy frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`
   
## Cơ sở dữ liệu MongoDB Atlas
- Database: `235624_TranHongPhat`
- Collection: `devices`
- Các trường: deviceId, name, deviceType, room, brand, model, quantity, status, purchaseDate, description
- Trạng thái (status): Đang sử dụng, Hư hỏng, Đang sửa chữa, Ngừng sử dụng
- Dữ liệu mẫu: `backend/seed-devices.json`
- Cấu hình kết nối: sao chép `backend/.env.example` thành `backend/.env` rồi điền thông tin thật (không đưa `.env` lên GitHub)
## Live Deployment URLs
- **Frontend URL:** https://frontend-235624-tranhongphat.onrender.com
- **Backend API URL:** https://api-235624-tranhongphat.onrender.com