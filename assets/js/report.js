(function () {
    function groupBy(array, getKey) {
        return array.reduce((acc, item) => {
            const key = getKey(item);
            acc[key] = acc[key] || [];
            acc[key].push(item);
            return acc;
        }, {});
    }

    function completedRevenueOrders(orders) {
        return orders.filter((order) => ['completed', 'shipping', 'confirmed', 'new'].includes(order.status));
    }

    function getSummary() {
        const db = window.EleganceApp.getDb();
        const activeProducts = db.products.filter((product) => product.status !== 'draft').length;
        const lowStockProducts = db.products.filter((product) => product.stock <= 10).length;
        const activePromotions = db.promotions.filter((promotion) => promotion.status === 'active').length;
        const revenue = completedRevenueOrders(db.orders).reduce((sum, order) => sum + window.EleganceApp.getOrderTotal(order), 0);

        return {
            totalProducts: activeProducts,
            lowStockProducts,
            activePromotions,
            revenue,
            totalOrders: db.orders.length,
            customers: db.customers.length
        };
    }

    function getRevenueByTime() {
        const db = window.EleganceApp.getDb();
        const grouped = groupBy(completedRevenueOrders(db.orders), (order) => order.date);

        return Object.keys(grouped)
            .sort()
            .map((date) => ({
                label: window.EleganceApp.formatDate(date),
                value: grouped[date].reduce((sum, order) => sum + window.EleganceApp.getOrderTotal(order), 0)
            }));
    }

    function getRevenueByCategory() {
        const db = window.EleganceApp.getDb();
        const totals = {};

        completedRevenueOrders(db.orders).forEach((order) => {
            order.items.forEach((item) => {
                const product = db.products.find((productItem) => productItem.id === item.productId);
                const category = db.categories.find((categoryItem) => categoryItem.id === product?.categoryId);
                const key = category?.name || 'Khác';
                totals[key] = (totals[key] || 0) + (item.qty * item.price);
            });
        });

        return Object.entries(totals)
            .map(([label, value]) => ({ label, value }))
            .sort((left, right) => right.value - left.value);
    }

    function getOrderRate() {
        const db = window.EleganceApp.getDb();
        const totals = groupBy(db.orders, (order) => order.status);
        const totalOrders = Math.max(db.orders.length, 1);

        return Object.entries(totals).map(([status, orders]) => ({
            status,
            label: window.EleganceApp.orderStatusMeta(status).label,
            value: Math.round((orders.length / totalOrders) * 100),
            count: orders.length
        }));
    }

    function getTopCustomers() {
        const db = window.EleganceApp.getDb();
        const totals = {};

        completedRevenueOrders(db.orders).forEach((order) => {
            totals[order.customerName] = (totals[order.customerName] || 0) + window.EleganceApp.getOrderTotal(order);
        });

        return Object.entries(totals)
            .map(([label, value]) => ({ label, value }))
            .sort((left, right) => right.value - left.value)
            .slice(0, 5);
    }

    function getInventorySnapshot() {
        const db = window.EleganceApp.getDb();
        return db.products
            .map((product) => ({
                label: product.name,
                value: product.stock,
                status: product.stock <= 10 ? 'low' : 'active'
            }))
            .sort((left, right) => left.value - right.value);
    }

    function renderBarChart(targetId, rows, formatter) {
        const target = document.getElementById(targetId);
        if (!target) return;
        if (!rows.length) {
            target.innerHTML = '<div class="empty-state">Chưa có dữ liệu để hiển thị.</div>';
            return;
        }

        const maxValue = Math.max(...rows.map((row) => row.value), 1);
        target.innerHTML = rows.map((row) => {
            const width = Math.max(8, Math.round((row.value / maxValue) * 100));
            const valueText = formatter ? formatter(row.value, row) : row.value;
            return `
                <div class="chart-row">
                    <div class="text-sm font-medium text-gray-700">${row.label}</div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width:${width}%"></div>
                    </div>
                    <div class="text-sm text-right text-gray-500">${valueText}</div>
                </div>
            `;
        }).join('');
    }

    window.EleganceReports = {
        getSummary,
        getRevenueByTime,
        getRevenueByCategory,
        getOrderRate,
        getTopCustomers,
        getInventorySnapshot,
        renderBarChart
    };
})();
