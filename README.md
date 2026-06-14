# TTCS - Website Bán Hàng Thời Trang

Project web bán hàng thời trang **ÉLÉGANCE** gồm frontend static HTML/CSS/JavaScript và backend Express kết nối MySQL.

## Công Nghệ

- Frontend: HTML, Tailwind CDN, Bootstrap, CSS/JavaScript 
- Backend: Node.js, Express, MySQL
- Database driver: `mysql2/promise`
- Auth: JWT

## Cấu Trúc Thư Mục

```text
.
|-- index.html
|-- assets/
|   |-- css/
|   |-- img/
|   `-- js/
|-- backend/
|   |-- package.json
|   |-- .env
|   `-- src/
|       |-- server.js
|       |-- data/mysql.js
|       |-- middlewares/auth.middleware.js
|       `-- routes/
|-- filesql/
`-- pages/
    |-- admin/
    |-- auth/
    |-- customer/
    |-- manager/
    |-- sale/
    `-- warehouse/
```

## Chức Năng Chính

- Khách hàng: đăng ký, đăng nhập, xem sản phẩm, giỏ hàng, thanh toán, lịch sử đơn hàng, thông tin cá nhân, đánh giá sản phẩm.
- Admin: quản lý tài khoản, khách hàng, cấu hình giao diện.
- Manager: dashboard, thông tin cửa hàng, danh mục, sản phẩm, khuyến mãi.
- Sale: quản lý đơn hàng, xử lý đổi trả, phản hồi đánh giá.
- Warehouse: nhập kho, điều chỉnh tồn kho, nhận hàng đổi trả.

## Cài Đặt Backend

```bash
cd backend
npm install
```

Tạo file `backend/.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=shop_thoitrang
JWT_SECRET=your_secret
JWT_EXPIRES_IN=1d
```

Chạy backend:

```bash
npm run dev
```

Hoặc:

```bash
npm start
```

API mặc định chạy tại:

```text
http://localhost:3000
```

## Chạy Frontend

Frontend là static site, có thể mở trực tiếp `index.html` trong trình duyệt.

Nếu muốn chạy bằng local server:

```bash
py -m http.server 5500 
```

Sau đó mở:

```text
http://localhost:5500
```

Frontend đang gọi API tại:

```js
const API_BASE = 'http://localhost:3000/api';
```

File cấu hình API nằm ở `assets/js/api.js`.

## API Chính

| Nhóm | Base path | Mô tả |
| --- | --- | --- |
| Auth | `/api/auth` | Đăng nhập, đăng ký |
| Users | `/api/users` | Quản lý user và profile |
| Products | `/api/products` | Sản phẩm, danh mục, biến thể, ảnh màu |
| Orders | `/api/orders` | Tạo đơn, xem đơn, cập nhật trạng thái |
| Inventory | `/api/inventory` | Tồn kho, nhập kho, audit, nhận hàng đổi trả |
| Returns | `/api/returns` | Yêu cầu và xử lý đổi trả |
| Reviews | `/api/reviews` | Đánh giá sản phẩm và phản hồi |
| Reports | `/api/reports` | Dashboard và báo cáo |
| Promotions | `/api/promotions` | Mã khuyến mãi |
| Store info | `/api/store-info` | Thông tin cửa hàng |
| Site settings | `/api/site-settings` | Cấu hình banner/top bar |

## Database

Thư mục `filesql/` chứa các file SQL dump cho database `shop_thoitrang`.

Lưu ý: code hiện tại đang dùng schema mới hơn một số file dump. Các bảng/cột cần có trong database hiện tại gồm:

- `categories.category_name`
- `categories.size_type`
- `product_color_images`
- `orders.promotion_id`
- `orders.discount_amount`
- `returns.note`
- `reviews.order_id`
- `reviews.reply_content`
- `reviews.reply_user_id`
- `reviews.replied_at`

Nếu import lại database từ `filesql/`, cần đảm bảo các bảng/cột trên tồn tại để backend chạy đúng.

## Tài Khoản Mẫu

Database seed có các role:

- `ADMIN`
- `MANAGER`
- `SALE`
- `WAREHOUSE`
- `CUSTOMER`

Một số tài khoản mẫu trong dump có mật khẩu đang lưu plaintext. Khi đưa vào môi trường thật, cần chuyển sang hash bằng `bcrypt`.

## Kiểm Tra Nhanh

Kiểm tra backend:

```bash
cd backend
node --check src/server.js
npm start
```

Kiểm tra API:

```bash
curl http://localhost:3000/
curl http://localhost:3000/api/products/public
curl http://localhost:3000/api/reports/dashboard
```
