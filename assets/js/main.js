(function () {


    function normalizeText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }



    function formatCurrency(amount) {
        return Number(amount || 0).toLocaleString('vi-VN') + ' đ';
    }

    function formatDate(dateValue) {
        if (!dateValue) return '--';
        return new Date(dateValue).toLocaleDateString('vi-VN');
    }

    function getInitials(name) {
        return (name || 'ND')
            .split(' ')
            .filter(Boolean)
            .slice(-2)
            .map((part) => part.charAt(0).toUpperCase())
            .join('');
    }

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('currentUser'));
        } catch (error) {
            return null;
        }
    }





    function ensureRole(allowedRoles, loginPath) {
        const user = getCurrentUser();
        const token = localStorage.getItem('authToken');
        const hasRequiredRole = !Array.isArray(allowedRoles) || allowedRoles.includes(user?.role);

        if (!user || !token || !hasRequiredRole) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            window.location.href = loginPath || '../../auth/login.html';
            return null;
        }
        return user;
    }

    function hydrateUser(displayId, avatarId, fallbackLabel) {
        const user = getCurrentUser();
        const displayEl = displayId ? document.getElementById(displayId) : null;
        const avatarEl = avatarId ? document.getElementById(avatarId) : null;
        const label = user?.name || fallbackLabel || 'Người dùng';

        if (displayEl) {
            displayEl.textContent = label;
        }
        if (avatarEl) {
            avatarEl.textContent = getInitials(label);
        }
        return user;
    }

    function logout(loginPath) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');

        window.location.href =
            loginPath || '../auth/login.html';
    }

    function getOrderTotal(order) {
        const subTotal = (order.items || []).reduce((sum, item) => sum + (item.price * item.qty), 0);
        return Math.max(0, subTotal - Number(order.discount || 0));
    }


    function orderStatusMeta(status) {
        const map = {
            PENDING: { label: 'Chờ xác nhận', className: 'badge-info' },
            CONFIRMED: { label: 'Đã xác nhận', className: 'badge-gold' },
            SHIPPING: { label: 'Đang giao', className: 'badge-warning' },
            DELIVERED: { label: 'Giao thành công', className: 'badge-success' },
            DELIVERY_FAILED: { label: 'Giao thất bại', className: 'badge-danger' },
            CANCELLED: { label: 'Đã hủy', className: 'badge-danger' },

            new: { label: 'Chờ xác nhận', className: 'badge-info' },
            confirmed: { label: 'Đã xác nhận', className: 'badge-gold' },
            shipping: { label: 'Đang giao', className: 'badge-warning' },
            completed: { label: 'Giao thành công', className: 'badge-success' },
            delivery_failed: { label: 'Giao thất bại', className: 'badge-danger' },
            cancelled: { label: 'Đã hủy', className: 'badge-danger' }
        };

        return map[status] || { label: status || 'Không rõ', className: 'badge-dark' };
    }

    function productStatusMeta(status) {
        const map = {
            active: { label: 'Đang bán', className: 'badge-success' },
            low: { label: 'Cần bổ sung', className: 'badge-warning' },
            draft: { label: 'Bản nháp', className: 'badge-dark' },
            hidden: { label: 'Tạm ẩn', className: 'badge-danger' }
        };
        return map[status] || { label: status || 'Không rõ', className: 'badge-dark' };
    }


    async function applyUiConfig() {
        const topBar = document.getElementById('topBar');
        const banner = document.getElementById('mainBanner');

        if ((!topBar && !banner) || typeof apiGet !== 'function') {
            return;
        }

        try {
            const uiConfig = await apiGet('/site-settings/ui');

            if (topBar) {
                topBar.textContent = uiConfig.topBarText || '';
                topBar.classList.toggle('hidden', !uiConfig.topBarVisible);
            }

            if (banner && uiConfig.bannerUrl) {
                banner.src = uiConfig.bannerUrl;
            }
        } catch (error) {
            console.error('Không thể tải cấu hình giao diện:', error);
        }
    }

    function renderNotice(targetId, message, type) {
        const target = document.getElementById(targetId);
        if (!target) return;
        const palettes = {
            success: 'border-green-200 bg-green-50 text-green-700',
            error: 'border-red-200 bg-red-50 text-red-700',
            info: 'border-amber-200 bg-amber-50 text-amber-700'
        };
        target.className = 'rounded-2xl border px-4 py-3 text-sm ' + (palettes[type] || palettes.info);
        target.textContent = message;
        target.classList.remove('hidden');
    }

    function hideNotice(targetId) {
        const target = document.getElementById(targetId);
        if (target) {
            target.classList.add('hidden');
        }
    }

    function initCustomerAccountHeader() {
        const accountArea = document.querySelector('[data-customer-account]');
        if (!accountArea) return;

        const loginPath = accountArea.dataset.loginPath || '../auth/login.html';
        const ordersPath = accountArea.dataset.ordersPath || 'orders.html';
        const profilePath = accountArea.dataset.profilePath || 'profile.html';
        const user = getCurrentUser();
        const isLoggedIn = Boolean(user);
        accountArea.className = 'relative';
        accountArea.innerHTML = `
            <button type="button" data-account-toggle
                class="flex items-center gap-2 hover:text-[#a87b51] transition"
                title="${isLoggedIn ? 'Tài khoản đã đăng nhập' : 'Đăng nhập / Đăng ký'}">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span class="hidden lg:inline text-sm font-semibold">${isLoggedIn ? escapeHtml(user.name) : 'Đăng nhập'}</span>
            </button>
            <div data-account-panel
                class="hidden absolute right-0 top-10 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-100 bg-white shadow-xl z-50 overflow-hidden">
                <div class="px-5 py-4 bg-[#fcfaf8] border-b border-gray-100">
                    <p class="text-xs uppercase text-[#a87b51] font-semibold">Tài khoản</p>
                    <p class="font-semibold text-gray-900 mt-1">${isLoggedIn ? escapeHtml(user.name) : 'Khách chưa đăng nhập'}</p>
                </div>
                <div class="p-3 grid gap-2">
                    ${isLoggedIn ? `
                        <a href="${profilePath}" class="rounded-xl px-4 py-3 hover:bg-[#fcfaf8] font-semibold text-gray-700">Thay đổi thông tin</a>
                        <a href="${ordersPath}" class="rounded-xl px-4 py-3 hover:bg-[#fcfaf8] font-semibold text-gray-700">Lịch sử đơn hàng</a>
                        <button type="button" data-account-logout
                            class="text-left rounded-xl px-4 py-3 hover:bg-red-50 font-semibold text-red-600">Đăng xuất</button>
                    ` : `
                        <a href="${loginPath}" class="rounded-xl px-4 py-3 bg-[#1a1a1a] text-white text-center font-semibold hover:bg-[#a87b51] transition">Đăng nhập</a>
                    `}
                </div>
            </div>
        `;

        const toggle = accountArea.querySelector('[data-account-toggle]');
        const panel = accountArea.querySelector('[data-account-panel]');
        toggle?.addEventListener('click', (event) => {
            event.stopPropagation();
            if (!isLoggedIn) {
                window.location.href = loginPath;
                return;
            }
            panel.classList.toggle('hidden');
        });
        accountArea.querySelector('[data-account-logout]')?.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            window.location.href = loginPath;
        });
        document.addEventListener('click', (event) => {
            if (!accountArea.contains(event.target)) {
                panel.classList.add('hidden');
            }
        });
    }


    document.addEventListener('DOMContentLoaded', applyUiConfig);
    document.addEventListener('DOMContentLoaded', initCustomerAccountHeader);

    window.EleganceApp = {
        normalizeText,
        escapeHtml,
        getCurrentUser,
        ensureRole,
        hydrateUser,
        logout,
        formatCurrency,
        formatDate,
        getInitials,
        getOrderTotal,
        orderStatusMeta,
        productStatusMeta,
        renderNotice,
        hideNotice,
        initCustomerAccountHeader
    };
})();
