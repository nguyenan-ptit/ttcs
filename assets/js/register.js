const API_BASE = 'http://localhost:3000/api';

document.getElementById('registerForm')?.addEventListener('submit', async function (event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const errorDiv = document.getElementById('registerError');

    if (!fullName || !username || !password || !confirmPassword) {
        errorDiv.textContent = 'Vui lòng điền đầy đủ thông tin';
        errorDiv.classList.remove('d-none');
        return;
    }
    if (password.length < 6) {
        errorDiv.textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
        errorDiv.classList.remove('d-none');
        return;
    }
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Mật khẩu xác nhận không khớp';
        errorDiv.classList.remove('d-none');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName,
                username,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Đăng ký thất bại');
        }

        alert('Đăng ký thành công.');
        window.location.href = 'login.html';
    } catch (error) {
        errorDiv.textContent = error.message || 'Đăng ký thất bại';
        errorDiv.classList.remove('d-none');
    }
});