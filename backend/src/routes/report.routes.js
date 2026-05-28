const express = require('express');
const pool = require('../data/mysql');

const router = express.Router();

router.get('/dashboard', async (req, res) => {
    try {
        const [[totalProductsRow]] = await pool.query(`
            SELECT COUNT(*) AS totalProducts
            FROM products
        `);

        const [[activeProductsRow]] = await pool.query(`
            SELECT COUNT(*) AS activeProducts
            FROM products
            WHERE is_active = 1
        `);

        const [[totalOrdersRow]] = await pool.query(`
            SELECT COUNT(*) AS totalOrders
            FROM orders
        `);

        const [[revenueRow]] = await pool.query(`
            SELECT COALESCE(SUM(total_amount), 0) AS totalRevenue
            FROM orders
            WHERE status = 'DELIVERED'
        `);

        const [[lowStockRow]] = await pool.query(`
            SELECT COUNT(*) AS lowStockProducts
            FROM (
                SELECT product_id, SUM(stock) AS totalStock
                FROM product_variants
                GROUP BY product_id
            ) product_stock
            WHERE totalStock <= 10
        `);

        res.json({
            totalProducts: Number(totalProductsRow.totalProducts),
            activeProducts: Number(activeProductsRow.activeProducts),
            totalOrders: Number(totalOrdersRow.totalOrders),
            totalRevenue: Number(revenueRow.totalRevenue),
            lowStockProducts: Number(lowStockRow.lowStockProducts)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Khong the lay du lieu dashboard' });
    }
});
router.get('/order-status', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT status, COUNT(*) AS count
            FROM orders
            GROUP BY status
        `);

        const total = rows.reduce((sum, row) => sum + Number(row.count), 0);

        const labels = {
            PENDING: 'Chờ xác nhận',
            CONFIRMED: 'Đã xác nhận',
            SHIPPING: 'Đang giao',
            DELIVERED: 'Đã giao',
            DELIVERY_FAILED: 'Giao thất bại',
            CANCELLED: 'Đã hủy'
        };

        const result = rows.map((row) => ({
            label: labels[row.status] || row.status,
            value: total > 0 ? Math.round((Number(row.count) / total) * 100) : 0,
            count: Number(row.count)
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Khong the lay ti le trang thai don hang' });
    }
});
router.get('/low-stock', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                p.name AS label,
                COALESCE(SUM(pv.stock), 0) AS value
            FROM products p
            LEFT JOIN product_variants pv ON pv.product_id = p.product_id
            GROUP BY p.product_id, p.name
            HAVING value <= 10
            ORDER BY value ASC
            LIMIT 6
        `);

        res.json(rows.map((row) => ({
            label: row.label,
            value: Number(row.value)
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Khong the lay san pham sap het hang' });
    }
});
router.get('/revenue-by-category', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                c.name AS label,
                COALESCE(SUM(od.quantity * od.price), 0) AS value
            FROM order_details od
            JOIN orders o ON o.order_id = od.order_id
            JOIN product_variants pv ON pv.variant_id = od.variant_id
            JOIN products p ON p.product_id = pv.product_id
            JOIN categories c ON c.category_id = p.category_id
            WHERE o.status = 'DELIVERED'
            GROUP BY c.category_id, c.name
            ORDER BY value DESC
        `);

        res.json(rows.map((row) => ({
            label: row.label,
            value: Number(row.value)
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Khong the lay doanh thu theo danh muc' });
    }
});
router.get('/top-customers', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                u.full_name AS label,
                COALESCE(SUM(o.total_amount), 0) AS value
            FROM orders o
            JOIN users u ON u.user_id = o.user_id
            WHERE o.status = 'DELIVERED'
            GROUP BY u.user_id, u.full_name
            ORDER BY value DESC
            LIMIT 5
        `);

        res.json(rows.map((row) => ({
            label: row.label,
            value: Number(row.value)
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Khong the lay khach hang mua nhieu nhat' });
    }
});
module.exports = router;