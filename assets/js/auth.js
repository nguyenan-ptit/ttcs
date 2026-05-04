// assets/js/auth.js

document.getElementById('loginForm')?.addEventListener('submit', function (e) {
    e.preventDefault(); // Ngăn chặn hành vi reload trang mặc định của form

    // Lấy dữ liệu người dùng nhập
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('loginError');

    // Dữ liệu giả lập (Mock Data) dựa trên database (bảng users và roles) 
    const mockUsers = [
        { username: 'admin_thanh', password: 'admin123', role: 'ADMIN', name: 'Nguyễn Duy Thành' },
        { username: 'manager_lan', password: '123456', role: 'MANAGER', name: 'Lê Thị Lan' },
        { username: 'sale_tuan', password: '123456', role: 'SALE', name: 'Trần Anh Tuấn' },
        { username: 'kho_hieu', password: '123456', role: 'WAREHOUSE', name: 'Phạm Minh Hiếu' },
        { username: 'khach_hang1', password: 'khach123', role: 'CUSTOMER', name: 'Hoàng Văn Nam' }
    ];

    // Tìm user khớp với thông tin nhập vào
    const passwordOverrides = JSON.parse(localStorage.getItem('elegance_password_overrides') || '{}');
    const accountOverrides = JSON.parse(localStorage.getItem('elegance_account_overrides') || '{}');
    const user = mockUsers.find((u) => {
        const activePassword = passwordOverrides[u.username] || u.password;
        return u.username === usernameInput && activePassword === passwordInput;
    });

    if (user) {
        // Đăng nhập thành công: Giấu thông báo lỗi
        errorDiv.classList.add('d-none');

        // Lưu thông tin người dùng vào Local Storage để các trang khác sử dụng
        localStorage.setItem('currentUser', JSON.stringify({
            ...user,
            name: accountOverrides[user.username]?.name || user.name,
            password: passwordOverrides[user.username] || user.password
        }));

        // Điều hướng dựa trên role (quyền) 
        switch (user.role) {
            case 'ADMIN':
                window.location.href = '../admin/user-list.html'; // [cite: 211]
                break;
            case 'MANAGER':
                window.location.href = '../manager/dashboard.html'; // [cite: 212]
                break;
            case 'WAREHOUSE':
                window.location.href = '../warehouse/import.html'; // [cite: 212]
                break;
            case 'SALE':
                window.location.href = '../sale/order-list.html'; // [cite: 213]
                break;
            case 'CUSTOMER':
                window.location.href = '../../index.html'; // Quay về trang chủ [cite: 213]
                break;
            default:
                alert('Tài khoản không có quyền truy cập hợp lệ!');
        }
    } else {
        // Đăng nhập thất bại: Hiển thị thông báo lỗi
        errorDiv.classList.remove('d-none');
    }
});
