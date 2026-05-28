// assets/js/auth.js

const API_BASE = 'http://localhost:3000/api';

document.getElementById('loginForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Dang nhap that bai');
        }

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify({
            userId: data.user.userId,
            username: data.user.username,
            name: data.user.name,
            role: data.user.role
        }));

        errorDiv.classList.add('d-none');

        switch (data.user.role) {
            case 'ADMIN':
                window.location.href = '../admin/user-list.html';
                break;
            case 'MANAGER':
                window.location.href = '../manager/dashboard.html';
                break;
            case 'WAREHOUSE':
                window.location.href = '../warehouse/import.html';
                break;
            case 'SALE':
                window.location.href = '../sale/order-list.html';
                break;
            case 'CUSTOMER':
                window.location.href = '../../index.html';
                break;
            default:
                alert('Tai khoan khong co quyen truy cap hop le');
        }
    } catch (error) {
        console.error(error);
        errorDiv.textContent = error.message || 'Sai tai khoan hoac mat khau';
        errorDiv.classList.remove('d-none');
    }
});