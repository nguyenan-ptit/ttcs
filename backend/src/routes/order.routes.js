const express = require('express');
const pool = require('../data/mysql.js');
const router = express.Router();


function parseOrderId(id) {
    return String(id).replace('ORD-', '');
}
function parseProductId(id) {
    return Number(String(id).replace('PRD-', ''));
}

function parseVariantId(id) {
    return Number(String(id).replace('VAR-', ''));
}
router.get('/', async (req, res) => {
    const [orders] = await pool.query(`
        SELECT
            order_id AS orderId,
            receiver_name AS customerName,
            receiver_phone AS phone,
            shipping_address AS address,
            payment_method AS payment,
            total_amount AS totalAmount,
            status,
            note,
            created_at AS date
        FROM orders
        ORDER BY date DESC
    `);
    res.json(orders.map((order) => ({
        id: `ORD-${order.orderId}`,
        orderId: order.orderId,
        customerName: order.customerName,
        phone: order.phone,
        address: order.address,
        date: order.date,
        status:  order.status,
        note: order.note || '',
        payment: order.payment,
        channel: 'Website',
        totalAmount: Number(order.totalAmount),
        items: [
            {
                name: 'Tổng đơn',
                qty: 1,
                price: Number(order.totalAmount)
            }
        ]
    })));
});
router.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId;

    const [orders] = await pool.query(
        `
        SELECT
            order_id AS orderId,
            receiver_name AS customerName,
            receiver_phone AS phone,
            shipping_address AS address,
            payment_method AS payment,
            total_amount AS totalAmount,
            status,
            note,
            created_at AS date
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
        `,
        [userId]
    );

    if (orders.length === 0) {
        return res.json([]);
    }

    const orderIds = orders.map((order) => order.orderId);

    const [items] = await pool.query(
        `
        SELECT
            od.order_id AS orderId,
            p.product_id AS productId,
            p.name,
            od.quantity AS qty,
            od.price,
            pv.color,
            pv.size
        FROM order_details od
        JOIN product_variants pv ON pv.variant_id = od.variant_id
        JOIN products p ON p.product_id = pv.product_id
        WHERE od.order_id IN (?)
        ORDER BY od.order_detail_id
        `,
        [orderIds]
    );

    res.json(orders.map((order) => ({
        id: `ORD-${order.orderId}`,
        orderId: order.orderId,
        customerName: order.customerName,
        phone: order.phone,
        address: order.address,
        date: order.date,
        status: order.status,
        note: order.note || '',
        payment: order.payment,
        channel: 'Website',
        totalAmount: Number(order.totalAmount),
        items: items
            .filter((item) => item.orderId === order.orderId)
            .map((item) => ({
                productId: `PRD-${String(item.productId).padStart(3, '0')}`,
                name: item.name,
                qty: Number(item.qty),
                price: Number(item.price),
                color: item.color,
                size: item.size
            }))
    })));
});
router.get('/:id', async (req, res) => {
    const orderId = parseOrderId(req.params.id);

    const [orders] = await pool.query(
        `
        SELECT
            order_id AS orderId,
            receiver_name AS customerName,
            receiver_phone AS phone,
            shipping_address AS address,
            payment_method AS payment,
            total_amount AS totalAmount,
            status,
            note,
            created_at AS date
        FROM orders
        WHERE order_id = ?
        `,
        [orderId]
    );

    if (orders.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const [items] = await pool.query(
        `
        SELECT
            p.product_id AS productId,
            p.name,
            od.quantity AS qty,
            od.price,
            pv.color,
            pv.size
        FROM order_details od
        JOIN product_variants pv ON pv.variant_id = od.variant_id
        JOIN products p ON p.product_id = pv.product_id
        WHERE od.order_id = ?
        `,
        [orderId]
    );

    const order = orders[0];

    res.json({
        id: `ORD-${order.orderId}`,
        orderId: order.orderId,
        customerName: order.customerName,
        phone: order.phone,
        address: order.address,
        date: order.date,
        status:  order.status,
        note: order.note || '',
        payment: order.payment,
        channel: 'Website',
        totalAmount: Number(order.totalAmount),
        items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            qty: Number(item.qty),
            price: Number(item.price),
            color: item.color,
            size: item.size
        }))
    });
});

router.patch('/:id/status', async (req, res) => {
    const orderId = parseOrderId(req.params.id);
    const { status } = req.body;

    const allowedStatuses = [
        'PENDING',
        'CONFIRMED',
        'SHIPPING',
        'DELIVERED',
        'DELIVERY_FAILED',
        'CANCELLED'
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [orders] = await connection.query(
            `
            SELECT
                order_id AS orderId,
                user_id AS userId,
                status
            FROM orders
            WHERE order_id = ?
            FOR UPDATE
            `,
            [orderId]
        );

        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        const currentOrder = orders[0];

        if (status === 'CANCELLED' && currentOrder.status !== 'PENDING') {
            await connection.rollback();
            return res.status(400).json({ message: 'Chỉ đơn hàng đang chờ xác nhận mới được hủy' });
        }

        if (status === 'CANCELLED' && currentOrder.status !== 'CANCELLED') {
            const [items] = await connection.query(
                `
                SELECT
                    variant_id AS variantId,
                    quantity
                FROM order_details
                WHERE order_id = ?
                `,
                [orderId]
            );

            for (const item of items) {
                await connection.query(
                    `
                    UPDATE product_variants
                    SET stock = stock + ?
                    WHERE variant_id = ?
                    `,
                    [item.quantity, item.variantId]
                );

                await connection.query(
                    `
                    INSERT INTO inventory_logs (
                        variant_id,
                        user_id,
                        type,
                        quantity
                    )
                    VALUES (?, ?, 'ORDER_CANCEL_RETURN', ?)
                    `,
                    [item.variantId, currentOrder.userId, item.quantity]
                );
            }
        }

        await connection.query(
            `
            UPDATE orders
            SET status = ?
            WHERE order_id = ?
            `,
            [status, orderId]
        );

        await connection.commit();

        res.json({
            message: 'Cập nhật trạng thái thành công',
            id: `ORD-${orderId}`,
            status
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Không thể cập nhật trạng thái đơn hàng' });
    } finally {
        connection.release();
    }
});
router.post('/', async (req, res) => {
    const { userId, customerName, phone, address, payment, note, items } = req.body;

    if (!userId || !customerName || !phone || !address || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Thiếu thông tin tạo đơn hàng' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const quantity = Number(item.qty || item.quantity || 1);
            let variants = [];

            if (item.variantId) {
                const variantId = parseVariantId(item.variantId);
                [variants] = await connection.query(
                    `
                    SELECT
                        pv.variant_id AS variantId,
                        pv.stock,
                        p.price
                    FROM product_variants pv
                    JOIN products p ON p.product_id = pv.product_id
                    WHERE pv.variant_id = ?
                    AND p.is_active = 1
                    `,
                    [variantId]
                );
            } else {
                const productId = parseProductId(item.productId);
                const color = item.color;
                const size = item.size;

                [variants] = await connection.query(
                    `
                    SELECT
                        pv.variant_id AS variantId,
                        pv.stock,
                        p.price
                    FROM product_variants pv
                    JOIN products p ON p.product_id = pv.product_id
                    WHERE p.product_id = ?
                      AND pv.color = ?
                      AND pv.size = ?
                      AND p.is_active = 1
                    `,
                    [productId, color, size]
                );
            }

            if (variants.length === 0) {
                throw new Error('Sản phẩm đã ngừng bán, vui lòng xóa khỏi giỏ hàng');
            }

            const variant = variants[0];

            if (Number(variant.stock) < quantity) {
                throw new Error('Sản phẩm không đủ tồn kho');
            }

            totalAmount += Number(variant.price) * quantity;

            orderItems.push({
                variantId: variant.variantId,
                quantity,
                price: Number(variant.price)
            });
        }

        const [orderResult] = await connection.query(
            `
            INSERT INTO orders (
                user_id,
                receiver_name,
                receiver_phone,
                shipping_address,
                payment_method,
                total_amount,
                status,
                note
            )
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)
            `,
            [
                userId,
                customerName,
                phone,
                address,
                payment || 'COD',
                totalAmount,
                note || null
            ]
        );

        const orderId = orderResult.insertId;

        for (const item of orderItems) {
            await connection.query(
                `
                INSERT INTO order_details (
                    order_id,
                    variant_id,
                    quantity,
                    price
                )
                VALUES (?, ?, ?, ?)
                `,
                [orderId, item.variantId, item.quantity, item.price]
            );

            await connection.query(
                `
                UPDATE product_variants
                SET stock = stock - ?
                WHERE variant_id = ?
                `,
                [item.quantity, item.variantId]
            );
        }

        await connection.commit();

        res.status(201).json({
            id: `ORD-${orderId}`,
            orderId,
            customerName,
            phone,
            address,
            status: 'PENDING',
            payment: payment || 'COD',
            totalAmount,
            note: note || '',
            items
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: error.message || 'Không thể tạo đơn hàng' });
    } finally {
        connection.release();
    }
});
module.exports = router;
