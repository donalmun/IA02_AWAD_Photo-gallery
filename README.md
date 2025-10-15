# Photo Gallery

Ứng dụng thư viện ảnh xây dựng với React, TypeScript và Vite, giúp duyệt bộ sưu tập ảnh từ Lorem Picsum với trải nghiệm mượt mà trên cả desktop lẫn thiết bị di động. Dự án sử dụng Tailwind CSS để tạo giao diện hiện đại, đồng thời tối ưu hiệu năng tải dữ liệu thông qua cơ chế prefetch và lưu trạng thái danh sách.

## ✨ Tính năng nổi bật
- **Khám phá thư viện ảnh vô hạn** với lưới responsive và hiệu ứng hover trực quan.
- **Xem chi tiết ảnh** kèm thông tin tác giả, kích thước và hình nền chất lượng cao.
- **Khôi phục trạng thái danh sách khi quay lại**: vị trí cuộn, dữ liệu đã tải và trạng thái phân trang được lưu trong `sessionStorage` để hiển thị ngay lập tức.
- **Prefetch trang tiếp theo** và tự động nạp thêm khi nội dung chưa đủ giúp giảm thời gian chờ của người dùng.
- **Xử lý lỗi và làm mới dữ liệu** thân thiện với thông báo rõ ràng và nút thử lại.

## 🏗️ Công nghệ chính
- [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) cho trải nghiệm phát triển nhanh
- [Tailwind CSS](https://tailwindcss.com/) cho thiết kế giao diện
- [React Router](https://reactrouter.com/) quản lý điều hướng đa trang
- [Axios](https://axios-http.com/) kết nối tới API Lorem Picsum
- ESLint cấu hình cho TypeScript và React Hooks

## 🚀 Bắt đầu
### Yêu cầu hệ thống
- Node.js >= 18
- npm >= 9

### Cài đặt
```bash
npm install
```

### Chạy môi trường phát triển
```bash
npm run dev
```
Mặc định Vite khởi chạy tại `http://localhost:5173`. Bạn có thể giữ phím `o` trong terminal để mở trình duyệt.

### Kiểm tra chất lượng mã nguồn
```bash
npm run lint
```

### Đóng gói sản phẩm
```bash
npm run build
```
Sau khi build, có thể xem thử bản dựng bằng:
```bash
npm run preview
```

## 📁 Cấu trúc thư mục
```
src/
├── components/       # PhotoList, PhotoDetail và các thành phần giao diện
├── hooks/            # Hook usePhotos quản lý phân trang, prefetch và cache
├── services/         # photoService kết nối đến Lorem Picsum API
├── utils/            # Hàm tiện ích (định dạng tên tác giả, v.v.)
├── constants/        # Hằng số cấu hình API và thông báo lỗi
├── App.tsx           # Định nghĩa router và layout cơ bản
└── main.tsx          # Điểm khởi động ứng dụng React
```

## 🧪 Lưu ý khi phát triển
- Trạng thái danh sách ảnh được lưu trong `sessionStorage` để tối ưu trải nghiệm khi điều hướng giữa danh sách và trang chi tiết. Gọi `refresh` (nút "Thử lại") sẽ xóa cache để tải mới dữ liệu.
- Hook `usePhotos` triển khai cơ chế prefetch để chuẩn bị sẵn trang tiếp theo; đảm bảo gọi `loadMore` thay vì gọi trực tiếp service.
- Khi bổ sung tính năng mới, hãy chạy `npm run lint` và `npm run build` trước khi tạo Pull Request.

## 📄 Giấy phép
Dự án được xây dựng phục vụ mục đích học tập. Bạn có thể tự do tùy biến, mở rộng và sử dụng theo nhu cầu của mình.
