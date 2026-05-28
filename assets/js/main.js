(function () {
    const DB_KEY = 'elegance_mock_db_v5';
    const PASSWORD_KEY = 'elegance_password_overrides';
    const ACCOUNT_KEY = 'elegance_account_overrides';

    const DEFAULT_DB = {
        uiConfig: {
            bannerUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1200&auto=format&fit=crop',
            topBarText: '🔥 Độc quyền online: Miễn phí vận chuyển cho đơn hàng từ 500.000đ',
            topBarVisible: true
        },
        categories: [
            { id: 'CAT-01', name: 'Áo sơ mi', productCount: 12, status: 'active', description: 'Dòng cơ bản cho công sở và smart casual.' },
            { id: 'CAT-02', name: 'Quần jean', productCount: 8, status: 'active', description: 'Form slim và straight cho nhóm khách hàng trẻ.' },
            { id: 'CAT-03', name: 'Chân váy', productCount: 6, status: 'active', description: 'Tập trung chất liệu mềm và bảng màu trung tính.' },
            { id: 'CAT-04', name: 'Outerwear', productCount: 4, status: 'draft', description: 'Áo khoác nhẹ cho bộ sưu tập giao mùa.' }
        ],
        products: [
            { id: 'PRD-001', sku: 'SHIRT-OXF-01', name: 'Áo Sơ Mi Trắng Oxford', categoryId: 'CAT-01', price: 350000, stock: 50, status: 'active', featured: true, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop' },
            { id: 'PRD-002', sku: 'JEAN-SLIM-02', name: 'Quần Jean Slim Fit', categoryId: 'CAT-02', price: 550000, stock: 24, status: 'active', featured: true, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop' },
            { id: 'PRD-003', sku: 'SKIRT-SILK-03', name: 'Chân váy midi lụa mềm', categoryId: 'CAT-03', price: 549000, stock: 18, status: 'active', featured: true, image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=600&auto=format&fit=crop' },
            { id: 'PRD-004', sku: 'BLOUSE-BTN-04', name: 'Áo tay dài phối nút', categoryId: 'CAT-01', price: 349000, stock: 9, status: 'low', featured: true, image: 'https://images.unsplash.com/photo-1534030615418-281ce13d2bc7?q=80&w=600&auto=format&fit=crop' },
            { id: 'PRD-005', sku: 'BLAZER-IVY-05', name: 'Blazer kem dáng đứng', categoryId: 'CAT-04', price: 890000, stock: 5, status: 'low', featured: false, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop' },
            { id: 'PRD-006', sku: 'TEE-ESS-06', name: 'Áo thun essential', categoryId: 'CAT-01', price: 220000, stock: 72, status: 'active', featured: false, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop' }
        ],
        inventoryVariants: [
            { id: 'VAR-001', productId: 'PRD-001', color: 'Trắng', size: 'M', stock: 16 },
            { id: 'VAR-002', productId: 'PRD-001', color: 'Trắng', size: 'L', stock: 14 },
            { id: 'VAR-003', productId: 'PRD-001', color: 'Xanh navy', size: 'M', stock: 10 },
            { id: 'VAR-004', productId: 'PRD-001', color: 'Xanh navy', size: 'L', stock: 10 },
            { id: 'VAR-005', productId: 'PRD-002', color: 'Xanh đậm', size: '29', stock: 8 },
            { id: 'VAR-006', productId: 'PRD-002', color: 'Xanh đậm', size: '30', stock: 7 },
            { id: 'VAR-007', productId: 'PRD-002', color: 'Xanh đậm', size: '31', stock: 5 },
            { id: 'VAR-008', productId: 'PRD-002', color: 'Xanh đậm', size: '32', stock: 4 },
            { id: 'VAR-009', productId: 'PRD-003', color: 'Be', size: 'S', stock: 6 },
            { id: 'VAR-010', productId: 'PRD-003', color: 'Be', size: 'M', stock: 7 },
            { id: 'VAR-011', productId: 'PRD-003', color: 'Đen', size: 'S', stock: 5 },
            { id: 'VAR-012', productId: 'PRD-004', color: 'Kem', size: 'M', stock: 4 },
            { id: 'VAR-013', productId: 'PRD-004', color: 'Kem', size: 'L', stock: 3 },
            { id: 'VAR-014', productId: 'PRD-004', color: 'Đen', size: 'M', stock: 2 },
            { id: 'VAR-015', productId: 'PRD-005', color: 'Kem', size: 'M', stock: 2 },
            { id: 'VAR-016', productId: 'PRD-005', color: 'Kem', size: 'L', stock: 2 },
            { id: 'VAR-017', productId: 'PRD-005', color: 'Xám', size: 'L', stock: 1 },
            { id: 'VAR-018', productId: 'PRD-006', color: 'Trắng', size: 'M', stock: 24 },
            { id: 'VAR-019', productId: 'PRD-006', color: 'Trắng', size: 'L', stock: 22 },
            { id: 'VAR-020', productId: 'PRD-006', color: 'Đen', size: 'M', stock: 12 },
            { id: 'VAR-021', productId: 'PRD-006', color: 'Đen', size: 'L', stock: 14 }
        ],
        promotions: [
            { id: 'PRM-01', name: 'Spring Capsule 15%', code: 'SPRING15', type: 'percent', value: 15, start: '2026-05-01', end: '2026-05-15', status: 'active' },
            { id: 'PRM-02', name: 'Flash sale cho khách mới', code: 'WELCOME10', type: 'percent', value: 10, start: '2026-05-05', end: '2026-05-12', status: 'scheduled' },
            { id: 'PRM-03', name: 'Quà tặng hóa đơn denim', code: 'DENIMPLUS', type: 'gift', value: 1, start: '2026-04-10', end: '2026-04-30', status: 'ended' }
        ],
        customers: [
            { id: 'CUS-01', name: 'Hoàng Văn Nam', tier: 'Gold', totalSpent: 2860000, orders: 8, lastOrder: '2026-05-04', status: 'active' },
            { id: 'CUS-02', name: 'Trần Thị Mai', tier: 'Silver', totalSpent: 1740000, orders: 5, lastOrder: '2026-05-03', status: 'active' },
            { id: 'CUS-03', name: 'Lê Minh Châu', tier: 'VIP', totalSpent: 4620000, orders: 11, lastOrder: '2026-05-02', status: 'active' },
            { id: 'CUS-04', name: 'Phạm Gia Hân', tier: 'Member', totalSpent: 920000, orders: 3, lastOrder: '2026-04-28', status: 'inactive' }
        ],
        orders: [
            {
                id: 'ORD-102401',
                customerId: 'CUS-01',
                customerName: 'Hoàng Văn Nam',
                phone: '0912345678',
                address: '123 Cầu Giấy, Hà Nội',
                date: '2026-05-04',
                status: 'new',
                payment: 'COD',
                channel: 'Website',
                note: 'Khách yêu cầu giao sau 18h.',
                items: [
                    { productId: 'PRD-001', name: 'Áo Sơ Mi Trắng Oxford', qty: 2, price: 350000, color: 'Trắng', size: 'M' },
                    { productId: 'PRD-002', name: 'Quần Jean Slim Fit', qty: 1, price: 550000, color: 'Xanh đậm', size: '31' }
                ]
            },
            {
                id: 'ORD-102389',
                customerId: 'CUS-02',
                customerName: 'Trần Thị Mai',
                phone: '0988777666',
                address: '58 Nguyễn Chí Thanh, Hà Nội',
                date: '2026-05-03',
                status: 'confirmed',
                payment: 'Bank Transfer',
                channel: 'Showroom',
                note: 'Đã xác nhận chuyển khoản.',
                items: [
                    { productId: 'PRD-003', name: 'Chân váy midi lụa mềm', qty: 1, price: 549000, color: 'Be', size: 'S' }
                ]
            },
            {
                id: 'ORD-102377',
                customerId: 'CUS-03',
                customerName: 'Lê Minh Châu',
                phone: '0909123456',
                address: '42 Trung Hòa, Hà Nội',
                date: '2026-05-02',
                status: 'completed',
                payment: 'COD',
                channel: 'Website',
                note: '',
                items: [
                    { productId: 'PRD-004', name: 'Áo tay dài phối nút', qty: 2, price: 349000, color: 'Kem', size: 'M' },
                    { productId: 'PRD-005', name: 'Blazer kem dáng đứng', qty: 1, price: 890000, color: 'Kem', size: 'L' }
                ]
            },
            {
                id: 'ORD-102341',
                customerId: 'CUS-01',
                customerName: 'Hoàng Văn Nam',
                phone: '0912345678',
                address: '123 Cầu Giấy, Hà Nội',
                date: '2026-04-29',
                status: 'completed',
                payment: 'COD',
                channel: 'Website',
                note: '',
                items: [
                    { productId: 'PRD-006', name: 'Áo thun essential', qty: 3, price: 220000, color: 'Trắng', size: 'L' }
                ]
            },
            {
                id: 'ORD-102298',
                customerId: 'CUS-04',
                customerName: 'Phạm Gia Hân',
                phone: '0933666888',
                address: '12 Láng Hạ, Hà Nội',
                date: '2026-04-27',
                status: 'cancelled',
                payment: 'E-Wallet',
                channel: 'Website',
                cancelReason: 'Khách yêu cầu hủy',
                note: 'Khách đổi mẫu, yêu cầu hủy.',
                items: [
                    { productId: 'PRD-002', name: 'Quần Jean Slim Fit', qty: 1, price: 550000, color: 'Xanh đậm', size: '29' }
                ]
            },
            {
                id: 'ORD-102265',
                customerId: 'CUS-02',
                customerName: 'Trần Thị Mai',
                phone: '0988777666',
                address: '58 Nguyễn Chí Thanh, Hà Nội',
                date: '2026-04-24',
                status: 'return_requested',
                payment: 'COD',
                channel: 'Website',
                note: 'Xin đổi size sang M.',
                items: [
                    { productId: 'PRD-003', name: 'Chân váy midi lụa mềm', qty: 1, price: 549000, color: 'Be', size: 'XS' }
                ]
            }
        ],
        inventoryReceipts: [
            {
                id: 'IMP-0001',
                date: '2026-05-04',
                supplier: 'Xưởng may Gia Lâm',
                productId: 'PRD-001',
                productName: 'Áo Sơ Mi Trắng Oxford',
                variantId: 'VAR-002',
                variantLabel: 'Trắng / L',
                quantity: 20,
                unitCost: 180000,
                totalCost: 3600000,
                staff: 'Phạm Minh Hiếu',
                note: 'Nhập bù size L bán tốt.',
                status: 'received'
            },
            {
                id: 'IMP-0002',
                date: '2026-05-01',
                supplier: 'Textile Partner VN',
                productId: 'PRD-006',
                productName: 'Áo thun essential',
                variantId: 'VAR-021',
                variantLabel: 'Đen / L',
                quantity: 14,
                unitCost: 95000,
                totalCost: 1330000,
                staff: 'Phạm Minh Hiếu',
                note: 'Nhập đợt cơ bản đầu tuần.',
                status: 'received'
            }
        ],
        stockAdjustments: [
            {
                id: 'ADJ-0001',
                date: '2026-05-05',
                productId: 'PRD-004',
                productName: 'Áo tay dài phối nút',
                variantId: 'VAR-012',
                variantLabel: 'Kem / M',
                beforeStock: 6,
                afterStock: 4,
                delta: -2,
                reason: 'Hàng lỗi đường may',
                note: 'Tách riêng để xử lý trả NCC.',
                staff: 'Phạm Minh Hiếu'
            },
            {
                id: 'ADJ-0002',
                date: '2026-05-03',
                productId: 'PRD-005',
                productName: 'Blazer kem dáng đứng',
                variantId: 'VAR-016',
                variantLabel: 'Kem / L',
                beforeStock: 1,
                afterStock: 2,
                delta: 1,
                reason: 'Cập nhật sau kiểm kê',
                note: 'Bổ sung lệch tồn giữa kho và sàn.',
                staff: 'Phạm Minh Hiếu'
            }
        ],
        returns: [
            {
                id: 'RTN-0001',
                type: 'customer',
                date: '2026-05-02',
                source: 'Trần Thị Mai',
                orderId: 'ORD-102389',
                productId: 'PRD-003',
                productName: 'Chân váy midi lụa mềm',
                variantId: 'VAR-009',
                variantLabel: 'Be / S',
                qty: 1,
                reason: 'Không vừa size',
                note: 'Khách muốn đổi sang size M.',
                status: 'pending',
                staff: 'Trần Anh Tuấn'
            },
            {
                id: 'RTN-0002',
                type: 'supplier',
                date: '2026-04-30',
                source: 'Xưởng may Gia Lâm',
                productId: 'PRD-004',
                productName: 'Áo tay dài phối nút',
                variantId: 'VAR-013',
                variantLabel: 'Kem / L',
                qty: 3,
                reason: 'Lỗi chất liệu',
                note: 'Đã gửi biên bản đối soát.',
                status: 'completed',
                staff: 'Phạm Minh Hiếu'
            }
        ],

        storeInfo: {
            name: 'Elegance Cầu Giấy',
            manager: 'Lê Thị Lan',
            phone: '1900 1234',
            hotline: '0988 111 222',
            email: 'support@elegance.vn',
            address: '123 Cầu Giấy, Hà Nội',
            openHours: '09:00 - 22:00',
            facebook: 'facebook.com/elegance.vn',
            instagram: '@elegance.vn',
            description: 'Cửa hàng thời trang tập trung vào dòng sản phẩm smart casual, công sở và capsule collection theo mùa.'
        }
    };

    const TEST_ORDERS = [
        {
            id: 'ORD-TEST002',
            customerId: 'CUS-02',
            customerName: 'Trần Thị Mai',
            phone: '0988777666',
            address: '58 Nguyễn Chí Thanh, Hà Nội',
            date: '2026-05-05',
            status: 'new',
            payment: 'COD',
            channel: 'Website',
            note: 'Đơn mẫu chờ xác nhận để kiểm thử luồng nhân viên bán hàng.',
            items: [
                { productId: 'PRD-002', name: 'Quần Jean Slim Fit', qty: 1, price: 550000, color: 'Xanh đậm', size: '30' },
                { productId: 'PRD-006', name: 'Áo thun essential', qty: 2, price: 220000, color: 'Trắng', size: 'M' }
            ]
        },
        {
            id: 'ORD-TEST001',
            customerId: 'CUS-03',
            customerName: 'Lê Minh Châu',
            phone: '0909123456',
            address: '42 Trung Hòa, Hà Nội',
            date: '2026-05-05',
            status: 'completed',
            payment: 'COD',
            channel: 'Website',
            note: 'Đơn mẫu để kiểm thử tra cứu, chi tiết đơn hàng và xử lý đổi trả.',
            items: [
                { productId: 'PRD-001', name: 'Áo Sơ Mi Trắng Oxford', qty: 1, price: 350000, color: 'Trắng', size: 'L' },
                { productId: 'PRD-003', name: 'Chân váy midi lụa mềm', qty: 1, price: 549000, color: 'Be', size: 'S' }
            ]
        }
    ];

    const TEST_RETURNS = [
        {
            id: 'RTN-TEST001',
            type: 'customer',
            date: '2026-05-05',
            source: 'Lê Minh Châu',
            orderId: 'ORD-TEST001',
            productId: 'PRD-001',
            productName: 'Áo Sơ Mi Trắng Oxford',
            variantId: 'VAR-002',
            variantLabel: 'Trắng / L',
            qty: 1,
            reason: 'Không vừa size',
            note: 'Phiếu mẫu để kiểm thử danh sách đổi trả.',
            status: 'pending',
            staff: 'Nhân viên sale'
        }
    ];

    function deepClone(value) {
        return JSON.parse(JSON.stringify(value));
    }

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

    function ensureTestOrders(db) {
        if (!db) return db;
        if (!Array.isArray(db.orders)) {
            db.orders = [];
        }

        TEST_ORDERS.forEach((order) => {
            if (!db.orders.some((item) => item.id === order.id)) {
                db.orders.unshift(deepClone(order));
            }
        });

        return db;
    }

    function normalizeOrderStatuses(db) {
        if (!db || !Array.isArray(db.orders)) return db;

        db.orders.forEach((order) => {
            if (order.status === 'preparing') {
                order.status = 'shipping';
            }
            if (order.id === 'ORD-102377' && order.status === 'shipping') {
                order.status = 'completed';
                order.note = order.note || 'Đơn hàng đã giao thành công.';
            }
        });

        return db;
    }

    function ensureTestReturns(db) {
        if (!db) return db;
        if (!Array.isArray(db.returns)) {
            db.returns = [];
        }

        const defaultReturnFixes = {
            'RTN-0001': {
                source: 'Trần Thị Mai',
                orderId: 'ORD-102389',
                variantLabel: 'Be / S'
            }
        };

        db.returns = db.returns.map((item) => {
            if (!defaultReturnFixes[item.id]) return item;
            return { ...item, ...defaultReturnFixes[item.id] };
        });

        TEST_RETURNS.forEach((item) => {
            const existingIndex = db.returns.findIndex((entry) => entry.id === item.id);
            if (existingIndex === -1) {
                db.returns.unshift(deepClone(item));
                return;
            }

            db.returns[existingIndex] = { ...deepClone(item), ...db.returns[existingIndex] };
        });

        return db;
    }

    function seedDb() {
        if (!localStorage.getItem(DB_KEY)) {
            const seededDb = deepClone(DEFAULT_DB);
            ensureTestOrders(seededDb);
            ensureTestReturns(seededDb);
            normalizeOrderStatuses(seededDb);
            localStorage.setItem(DB_KEY, JSON.stringify(seededDb));
            return;
        }

        try {
            const existingDb = JSON.parse(localStorage.getItem(DB_KEY));
            ensureTestOrders(existingDb);
            ensureTestReturns(existingDb);
            normalizeOrderStatuses(existingDb);
            localStorage.setItem(DB_KEY, JSON.stringify(existingDb));
        } catch (error) {
            const seededDb = deepClone(DEFAULT_DB);
            ensureTestOrders(seededDb);
            ensureTestReturns(seededDb);
            normalizeOrderStatuses(seededDb);
            localStorage.setItem(DB_KEY, JSON.stringify(seededDb));
        }
    }

    function getDb() {
        seedDb();
        return JSON.parse(localStorage.getItem(DB_KEY));
    }

    function setDb(nextDb) {
        localStorage.setItem(DB_KEY, JSON.stringify(nextDb));
    }

    function updateDb(mutator) {
        const nextDb = getDb();
        mutator(nextDb);
        setDb(nextDb);
        return nextDb;
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

    function getPasswordOverrides() {
        try {
            return JSON.parse(localStorage.getItem(PASSWORD_KEY)) || {};
        } catch (error) {
            return {};
        }
    }

    function setPasswordOverrides(nextOverrides) {
        localStorage.setItem(PASSWORD_KEY, JSON.stringify(nextOverrides));
    }

    function getAccountOverrides() {
        try {
            return JSON.parse(localStorage.getItem(ACCOUNT_KEY)) || {};
        } catch (error) {
            return {};
        }
    }

    function setAccountOverrides(nextOverrides) {
        localStorage.setItem(ACCOUNT_KEY, JSON.stringify(nextOverrides));
    }

    function changeCurrentUserPassword({ currentPassword, newPassword, confirmPassword }) {
        const user = getCurrentUser();
        if (!user?.username) {
            throw new Error('Vui lòng đăng nhập để đổi mật khẩu.');
        }

        const current = String(currentPassword || '').trim();
        const next = String(newPassword || '').trim();
        const confirm = String(confirmPassword || '').trim();
        const overrides = getPasswordOverrides();
        const activePassword = overrides[user.username] || user.password;

        if (!current || !next || !confirm) {
            throw new Error('Vui lòng nhập đầy đủ thông tin đổi mật khẩu.');
        }
        if (current !== activePassword) {
            throw new Error('Mật khẩu hiện tại không đúng.');
        }
        if (next.length < 6) {
            throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.');
        }
        if (next !== confirm) {
            throw new Error('Xác nhận mật khẩu mới không khớp.');
        }

        overrides[user.username] = next;
        setPasswordOverrides(overrides);
        localStorage.setItem('currentUser', JSON.stringify({ ...user, password: next }));
        return true;
    }

    function ensureRole(allowedRoles, loginPath) {
        const user = getCurrentUser();
        if (!user || (Array.isArray(allowedRoles) && !allowedRoles.includes(user.role))) {
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
        window.location.href = loginPath || '../auth/login.html';
    }

    function getOrderTotal(order) {
        const subTotal = (order.items || []).reduce((sum, item) => sum + (item.price * item.qty), 0);
        return Math.max(0, subTotal - Number(order.discount || 0));
    }

    function normalizeOrderItems(items) {
        return (items || []).map((item) => ({
            productId: String(item.productId || item.id || ''),
            name: item.name,
            qty: Number(item.qty || item.quantity || 1),
            price: Number(item.price || 0),
            color: item.color || '',
            size: item.size || ''
        }));
    }

    function getCustomerByUser(user, db) {
        if (!user) return null;
        return db.customers.find((customer) => customer.username === user.username) ||
            db.customers.find((customer) => customer.name === user.name) ||
            null;
    }

    function getCustomerProfile(user) {
        const db = getDb();
        const customer = getCustomerByUser(user || getCurrentUser(), db);
        const latestOrder = db.orders.find((order) => order.customerName === (user || getCurrentUser())?.name);

        return {
            name: customer?.name || user?.name || getCurrentUser()?.name || '',
            phone: customer?.phone || latestOrder?.phone || '',
            address: customer?.address || latestOrder?.address || ''
        };
    }

    function updateCustomerProfile({ user, name, phone, address }) {
        const currentUser = user || getCurrentUser();
        if (!currentUser) {
            throw new Error('Vui lòng đăng nhập để cập nhật thông tin khách hàng.');
        }

        const normalizedName = String(name || currentUser.name || '').trim();
        const normalizedPhone = String(phone || '').trim();
        const normalizedAddress = String(address || '').trim();
        let updatedProfile = null;

        if (!normalizedName) {
            throw new Error('Vui lòng nhập họ tên.');
        }

        updateDb((db) => {
            let customer = getCustomerByUser(currentUser, db);
            const oldCustomerName = customer?.name || currentUser.name;
            if (!customer) {
                customer = {
                    id: nextId('CUS', db.customers),
                    username: currentUser.username,
                    name: normalizedName,
                    tier: 'Member',
                    totalSpent: 0,
                    orders: 0,
                    lastOrder: '',
                    status: 'active'
                };
                db.customers.push(customer);
            }

            customer.username = currentUser.username;
            customer.name = normalizedName;
            customer.phone = normalizedPhone;
            customer.address = normalizedAddress;

            db.orders.forEach((order) => {
                if (order.customerId === customer.id || order.customerName === oldCustomerName) {
                    order.customerId = customer.id;
                    order.customerName = normalizedName;
                }
            });

            updatedProfile = {
                name: customer.name,
                phone: customer.phone,
                address: customer.address
            };
        });

        const accountOverrides = getAccountOverrides();
        accountOverrides[currentUser.username] = {
            ...(accountOverrides[currentUser.username] || {}),
            name: normalizedName,
            phone: normalizedPhone,
            address: normalizedAddress
        };
        setAccountOverrides(accountOverrides);
        localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, name: normalizedName }));

        return updatedProfile;
    }

    function createCustomerOrder({ user, customerName, phone, address, payment, items, note, promotionCode, discount }) {
        const normalizedItems = normalizeOrderItems(items);
        if (!normalizedItems.length) {
            throw new Error('Giỏ hàng đang trống, không thể tạo đơn hàng.');
        }

        let createdOrder = null;
        updateDb((db) => {
            let customer = getCustomerByUser(user, db);
            if (!customer) {
                customer = {
                    id: nextId('CUS', db.customers),
                    username: user?.username,
                    name: user?.name || customerName || 'Khách hàng',
                    tier: 'Member',
                    totalSpent: 0,
                    orders: 0,
                    lastOrder: '',
                    status: 'active'
                };
                db.customers.push(customer);
            }

            const total = normalizedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
            const today = new Date().toISOString().slice(0, 10);
            const orderNumber = String(Date.now()).slice(-6);

            createdOrder = {
                id: `ORD-${orderNumber}`,
                customerId: customer.id,
                customerName: customer.name,
                phone: String(phone || '').trim(),
                address: String(address || '').trim(),
                date: today,
                status: 'new',
                payment: payment || 'COD',
                channel: 'Website',
                promotionCode: String(promotionCode || '').trim(),
                discount: Number(discount || 0),
                note: String(note || '').trim(),
                items: normalizedItems
            };

            db.orders.unshift(createdOrder);
            customer.phone = createdOrder.phone;
            customer.address = createdOrder.address;
            customer.orders = Number(customer.orders || 0) + 1;
            customer.totalSpent = Number(customer.totalSpent || 0) + total;
            customer.lastOrder = today;
        });

        return createdOrder;
    }

    function findCategoryById(id) {
        return getDb().categories.find((category) => category.id === id) || null;
    }

    function findProductById(id) {
        return getDb().products.find((product) => product.id === id) || null;
    }

    function findVariantById(id) {
        return getDb().inventoryVariants.find((variant) => variant.id === id) || null;
    }

    function getProductVariants(productId) {
        return getDb().inventoryVariants.filter((variant) => variant.productId === productId);
    }

    function getVariantLabel(variant) {
        return `${variant.color} / ${variant.size}`;
    }

    function searchProducts(keyword) {
        const normalizedKeyword = normalizeText(keyword);
        if (!normalizedKeyword) return getDb().products;
        return getDb().products.filter((product) => {
            return normalizeText(product.name).includes(normalizedKeyword) ||
                normalizeText(product.sku).includes(normalizedKeyword);
        });
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

    function nextId(prefix, collection) {
        return `${prefix}-${String(collection.length + 1).padStart(4, '0')}`;
    }

    function resolveProductStatus(product, stock) {
        if (product.status === 'draft') {
            return 'draft';
        }
        return stock <= 10 ? 'low' : 'active';
    }

    function syncProductStock(db, productId) {
        const product = db.products.find((item) => item.id === productId);
        if (!product) return null;
        const variants = db.inventoryVariants.filter((item) => item.productId === productId);
        product.stock = variants.reduce((sum, item) => sum + Number(item.stock || 0), 0);
        product.status = resolveProductStatus(product, product.stock);
        return product;
    }

    function ensurePositiveInteger(value, emptyMessage, invalidMessage) {
        const raw = String(value ?? '').trim();
        if (!raw) {
            throw new Error(emptyMessage);
        }
        if (!/^\d+$/.test(raw)) {
            throw new Error(invalidMessage);
        }
        return Number(raw);
    }

    function getWarehouseSummary() {
        const db = getDb();
        const today = new Date().toISOString().slice(0, 10);
        return {
            totalProducts: db.products.length,
            totalVariants: db.inventoryVariants.length,
            lowStockProducts: db.products.filter((product) => product.stock <= 10).length,
            todayReceipts: db.inventoryReceipts.filter((receipt) => receipt.date === today).length,
            pendingSupplierReturns: db.returns.filter((item) => item.type === 'supplier' && item.status !== 'completed').length
        };
    }

    function createInventoryReceipt({ variantId, supplier, quantity, unitCost, note, staff, receivedDate }) {
        const normalizedQuantity = ensurePositiveInteger(quantity, 'Vui lòng nhập số lượng cần nhập.', 'Số lượng nhập phải là số nguyên hợp lệ.');
        const normalizedCost = ensurePositiveInteger(unitCost, 'Vui lòng nhập đơn giá nhập.', 'Đơn giá nhập phải là số nguyên hợp lệ.');
        const supplierName = String(supplier || '').trim();
        if (!supplierName) {
            throw new Error('Vui lòng nhập tên nhà cung cấp.');
        }

        let createdReceipt = null;
        updateDb((db) => {
            const variant = db.inventoryVariants.find((item) => item.id === variantId);
            if (!variant) {
                throw new Error('Không tìm thấy biến thể sản phẩm cần nhập.');
            }
            const product = db.products.find((item) => item.id === variant.productId);
            if (!product) {
                throw new Error('Không tìm thấy sản phẩm tương ứng.');
            }

            variant.stock += normalizedQuantity;
            syncProductStock(db, product.id);

            createdReceipt = {
                id: nextId('IMP', db.inventoryReceipts),
                date: receivedDate || new Date().toISOString().slice(0, 10),
                supplier: supplierName,
                productId: product.id,
                productName: product.name,
                variantId: variant.id,
                variantLabel: getVariantLabel(variant),
                quantity: normalizedQuantity,
                unitCost: normalizedCost,
                totalCost: normalizedCost * normalizedQuantity,
                staff: staff || 'Nhân viên kho',
                note: String(note || '').trim(),
                status: 'received'
            };

            db.inventoryReceipts.unshift(createdReceipt);
        });

        return createdReceipt;
    }

    function createStockAudit({ productId, items, note, staff, auditDate }) {
        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Không có biến thể nào để cập nhật.');
        }

        let result = { updatedCount: 0, changedVariants: [] };
        updateDb((db) => {
            const product = db.products.find((item) => item.id === productId);
            if (!product) {
                throw new Error('Không tìm thấy sản phẩm cần kiểm kê.');
            }

            items.forEach((item) => {
                const variant = db.inventoryVariants.find((variantItem) => variantItem.id === item.variantId && variantItem.productId === productId);
                if (!variant) {
                    throw new Error('Không tìm thấy biến thể sản phẩm cần cập nhật.');
                }

                const actualStock = ensurePositiveInteger(item.actualStock, 'Vui lòng nhập số lượng thực tế.', 'Số lượng thực tế phải là số nguyên hợp lệ.');
                const beforeStock = Number(variant.stock || 0);
                const afterStock = actualStock;
                const delta = afterStock - beforeStock;

                variant.stock = afterStock;

                if (delta !== 0) {
                    const adjustment = {
                        id: nextId('ADJ', db.stockAdjustments),
                        date: auditDate || new Date().toISOString().slice(0, 10),
                        productId: product.id,
                        productName: product.name,
                        variantId: variant.id,
                        variantLabel: getVariantLabel(variant),
                        beforeStock,
                        afterStock,
                        delta,
                        reason: 'Kiểm kê tồn kho',
                        note: String(note || '').trim(),
                        staff: staff || 'Nhân viên kho'
                    };
                    db.stockAdjustments.unshift(adjustment);
                    result.changedVariants.push(adjustment);
                }
            });

            syncProductStock(db, product.id);
            result.updatedCount = result.changedVariants.length;
        });

        return result;
    }

    function createSupplierReturn({ variantId, supplier, quantity, reason, note, staff, returnDate }) {
        const normalizedQuantity = ensurePositiveInteger(quantity, 'Vui lòng nhập số lượng trả.', 'Số lượng trả phải là số nguyên hợp lệ.');
        const supplierName = String(supplier || '').trim();
        const reasonText = String(reason || '').trim();

        if (!supplierName) {
            throw new Error('Vui lòng nhập tên nhà cung cấp.');
        }
        if (!reasonText) {
            throw new Error('Vui lòng nhập lý do trả hàng.');
        }

        let createdReturn = null;
        updateDb((db) => {
            const variant = db.inventoryVariants.find((item) => item.id === variantId);
            if (!variant) {
                throw new Error('Không tìm thấy biến thể sản phẩm cần trả.');
            }
            const product = db.products.find((item) => item.id === variant.productId);
            if (!product) {
                throw new Error('Không tìm thấy sản phẩm tương ứng.');
            }
            if (normalizedQuantity > variant.stock) {
                throw new Error('Số lượng trả không được lớn hơn tồn kho hiện tại của biến thể.');
            }

            const beforeStock = variant.stock;
            variant.stock -= normalizedQuantity;
            const afterStock = variant.stock;
            syncProductStock(db, product.id);

            db.stockAdjustments.unshift({
                id: nextId('ADJ', db.stockAdjustments),
                date: returnDate || new Date().toISOString().slice(0, 10),
                productId: product.id,
                productName: product.name,
                variantId: variant.id,
                variantLabel: getVariantLabel(variant),
                beforeStock,
                afterStock,
                delta: afterStock - beforeStock,
                reason: 'Trả nhà cung cấp',
                note: String(note || '').trim() || reasonText,
                staff: staff || 'Nhân viên kho'
            });

            createdReturn = {
                id: nextId('RTN', db.returns),
                type: 'supplier',
                date: returnDate || new Date().toISOString().slice(0, 10),
                source: supplierName,
                productId: product.id,
                productName: product.name,
                variantId: variant.id,
                variantLabel: getVariantLabel(variant),
                qty: normalizedQuantity,
                reason: reasonText,
                note: String(note || '').trim(),
                status: 'processing',
                staff: staff || 'Nhân viên kho'
            };

            db.returns.unshift(createdReturn);
        });

        return createdReturn;
    }

    function completeSupplierReturn(returnId) {
        let completed = null;
        updateDb((db) => {
            const target = db.returns.find((item) => item.id === returnId && item.type === 'supplier');
            if (!target) {
                throw new Error('Không tìm thấy phiếu trả nhà cung cấp.');
            }
            target.status = 'completed';
            completed = target;
        });
        return completed;
    }

    async function applyUiConfig() {

        const topBar = document.getElementById('topBar');
        const banner = document.getElementById('mainBanner');
        let uiConfig = getDb().uiConfig;
        if (typeof apiGet === 'function') {
            try {
                uiConfig = await apiGet('/site-settings/ui');
            } catch (error) {
                console.error('Không thể tải cấu hình giao diện từ API:', error);
            }
        }

        if (topBar) {
            topBar.textContent = uiConfig.topBarText;
            topBar.classList.toggle('hidden', !uiConfig.topBarVisible);
        }

        if (banner && uiConfig.bannerUrl) {
            banner.src = uiConfig.bannerUrl;
        }
    }

    function upsertUiConfig(partialConfig) {
        return updateDb((db) => {
            db.uiConfig = { ...db.uiConfig, ...partialConfig };
        }).uiConfig;
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
            window.location.href = loginPath;
        });
        document.addEventListener('click', (event) => {
            if (!accountArea.contains(event.target)) {
                panel.classList.add('hidden');
            }
        });
    }

    seedDb();
    document.addEventListener('DOMContentLoaded', applyUiConfig);
    document.addEventListener('DOMContentLoaded', initCustomerAccountHeader);

    window.EleganceApp = {
        dbKey: DB_KEY,
        passwordKey: PASSWORD_KEY,
        accountKey: ACCOUNT_KEY,
        deepClone,
        getDb,
        setDb,
        updateDb,
        normalizeText,
        escapeHtml,
        getCurrentUser,
        getPasswordOverrides,
        setPasswordOverrides,
        getAccountOverrides,
        setAccountOverrides,
        changeCurrentUserPassword,
        ensureRole,
        hydrateUser,
        logout,
        formatCurrency,
        formatDate,
        getInitials,
        getOrderTotal,
        getCustomerProfile,
        updateCustomerProfile,
        createCustomerOrder,
        findCategoryById,
        findProductById,
        findVariantById,
        getProductVariants,
        getVariantLabel,
        searchProducts,
        orderStatusMeta,
        productStatusMeta,
        getWarehouseSummary,
        createInventoryReceipt,
        createStockAudit,
        createSupplierReturn,
        completeSupplierReturn,
        upsertUiConfig,
        renderNotice,
        hideNotice,
        initCustomerAccountHeader
    };
})();
