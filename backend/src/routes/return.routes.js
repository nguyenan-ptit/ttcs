const express = require('express');
const pool = require('../data/mysql');

const router = express.Router();

function formatOrderId(id) {
    return `ORD-${id}`;
}

function formatProductId(id) {
    return `PRD-${String(id).padStart(3, '0')}`;
}

function formatVariantId(id) {
    return `VAR-${String(id).padStart(3, '0')}`;
}

function formatReturnId(id) {
    return `RTN-${String(id).padStart(4, '0')}`;
}

function parseOrderId(id) {
    return Number(String(id).replace('ORD-', ''));
}

function mapReturnStatus(status, isReceived = false) {
    if (isReceived) {
        return 'completed';
    }

    const map = {
        REQUESTED: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected',
        COMPLETED: 'completed'
    };

    return map[status] || 'pending';
}

function mapDbReturnStatus(decision) {
    if (decision === 'rejected') {
        return 'REJECTED';
    }

    if (decision === 'approved') {
        return 'APPROVED';
    }

    return 'REQUESTED';
}

function mapReturnRows(rows) {
    const returnsById = new Map();

    for (const row of rows) {
        if (!returnsById.has(row.returnId)) {
            returnsById.set(row.returnId, {
                id: formatReturnId(row.returnId),
                returnId: row.returnId,
                orderId: formatOrderId(row.orderId),
                source: row.receiverName || row.customerName,
                reason: row.reason,
                note: row.orderNote || '',
                date: row.createdAt,
                rawStatus: row.status,
                isReceived: Boolean(row.isReceived),
                staff: '',
                items: []
            });
        } else {
            const returnItem = returnsById.get(row.returnId);
            returnItem.isReceived = returnItem.isReceived && Boolean(row.isReceived);
        }

        const returnItem = returnsById.get(row.returnId);

        returnItem.items.push({
            productId: formatProductId(row.productId),
            productName: row.productName,
            variantId: formatVariantId(row.variantId),
            variantLabel: `${row.color} / ${row.size}`,
            qty: Number(row.quantity || 0),
            price: Number(row.price || 0),
            isReceived: Boolean(row.isReceived)
        });
    }

    return [...returnsById.values()].map((item) => {
        const firstItem = item.items[0];
        const extraCount = Math.max(item.items.length - 1, 0);

        return {
            ...item,
            status: mapReturnStatus(item.rawStatus, item.isReceived),
            productName: firstItem
                ? `${firstItem.productName}${extraCount ? ` + ${extraCount} sản phẩm` : ''}`
                : '--',
            variantLabel: firstItem
                ? `${firstItem.variantLabel}${extraCount ? ` + ${extraCount} biến thể` : ''}`
                : '--',
            qty: item.items.reduce((sum, orderItem) => sum + Number(orderItem.qty || 0), 0)
        };
    });
}

router.get('/', async (req, res) => {
    const [rows] = await pool.query(`
        SELECT
            r.return_id AS returnId,
            r.order_id AS orderId,
            r.reason,
            r.status,
            r.created_at AS createdAt,
            o.receiver_name AS receiverName,
            o.note AS orderNote,
            u.full_name AS customerName,
            od.quantity,
            od.price,
            p.product_id AS productId,
            p.name AS productName,
            pv.variant_id AS variantId,
            pv.color,
            pv.size,
            EXISTS (
                SELECT 1
                FROM inventory_logs il
                JOIN users log_user ON log_user.user_id = il.user_id
                JOIN roles log_role ON log_role.role_id = log_user.role_id
                WHERE il.variant_id = pv.variant_id
                  AND il.type = 'ORDER_CANCEL_RETURN'
                  AND log_role.role_name = 'WAREHOUSE'
                  AND il.quantity >= od.quantity
                  AND il.created_at >= r.created_at
            ) AS isReceived
        FROM returns r
        JOIN orders o ON o.order_id = r.order_id
        JOIN users u ON u.user_id = r.user_id
        JOIN order_details od ON od.order_id = r.order_id
        JOIN product_variants pv ON pv.variant_id = od.variant_id
        JOIN products p ON p.product_id = pv.product_id
        ORDER BY r.created_at DESC, r.return_id DESC, od.order_detail_id
    `);

    res.json(mapReturnRows(rows));
});

router.get('/user/:userId', async (req, res) => {
    const userId = Number(req.params.userId);

    if (!userId) {
        return res.status(400).json({ message: 'Mã khách hàng không hợp lệ' });
    }

    const [rows] = await pool.query(
        `
        SELECT
            r.return_id AS returnId,
            r.order_id AS orderId,
            r.reason,
            r.status,
            r.created_at AS createdAt,
            o.receiver_name AS receiverName,
            o.note AS orderNote,
            u.full_name AS customerName,
            od.quantity,
            od.price,
            p.product_id AS productId,
            p.name AS productName,
            pv.variant_id AS variantId,
            pv.color,
            pv.size,
            EXISTS (
                SELECT 1
                FROM inventory_logs il
                JOIN users log_user ON log_user.user_id = il.user_id
                JOIN roles log_role ON log_role.role_id = log_user.role_id
                WHERE il.variant_id = pv.variant_id
                  AND il.type = 'ORDER_CANCEL_RETURN'
                  AND log_role.role_name = 'WAREHOUSE'
                  AND il.quantity >= od.quantity
                  AND il.created_at >= r.created_at
            ) AS isReceived
        FROM returns r
        JOIN orders o ON o.order_id = r.order_id
        JOIN users u ON u.user_id = r.user_id
        JOIN order_details od ON od.order_id = r.order_id
        JOIN product_variants pv ON pv.variant_id = od.variant_id
        JOIN products p ON p.product_id = pv.product_id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC, r.return_id DESC, od.order_detail_id
        `,
        [userId]
    );

    res.json(mapReturnRows(rows));
});

router.get('/orders/:id', async (req, res) => {
    const orderId = parseOrderId(req.params.id);

    if (!orderId) {
        return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ' });
    }

    const [orders] = await pool.query(
        `
        SELECT
            order_id AS orderId,
            user_id AS userId,
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
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng theo mã đã nhập' });
    }

    const order = orders[0];

    if (order.status === 'CANCELLED') {
        return res.status(400).json({ message: 'Đơn đã hủy không đủ điều kiện đổi trả' });
    }

    const [items] = await pool.query(
        `
        SELECT
            p.product_id AS productId,
            p.name,
            od.quantity AS qty,
            od.price,
            pv.variant_id AS variantId,
            pv.color,
            pv.size
        FROM order_details od
        JOIN product_variants pv ON pv.variant_id = od.variant_id
        JOIN products p ON p.product_id = pv.product_id
        WHERE od.order_id = ?
        ORDER BY od.order_detail_id
        `,
        [orderId]
    );

    res.json({
        id: formatOrderId(order.orderId),
        orderId: order.orderId,
        userId: order.userId,
        customerName: order.customerName,
        phone: order.phone,
        address: order.address,
        date: order.date,
        status: order.status,
        note: order.note || '',
        payment: order.payment,
        totalAmount: Number(order.totalAmount),
        items: items.map((item) => ({
            productId: formatProductId(item.productId),
            variantId: formatVariantId(item.variantId),
            name: item.name,
            qty: Number(item.qty),
            price: Number(item.price),
            color: item.color,
            size: item.size
        }))
    });
});

router.post('/request', async (req, res) => {
    const orderId = parseOrderId(req.body.orderId);
    const userId = Number(req.body.userId);
    const reason = String(req.body.reason || '').trim();

    if (!orderId || !userId) {
        return res.status(400).json({ message: 'Thiếu thông tin đơn hàng hoặc khách hàng' });
    }

    if (!reason) {
        return res.status(400).json({ message: 'Vui lòng nhập lý do đổi trả' });
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
              AND user_id = ?
            FOR UPDATE
            `,
            [orderId, userId]
        );

        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng của khách hàng hiện tại' });
        }

        if (orders[0].status !== 'DELIVERED') {
            await connection.rollback();
            return res.status(400).json({ message: 'Chỉ đơn đã giao thành công mới có thể yêu cầu đổi trả' });
        }

        const [existingReturns] = await connection.query(
            `
            SELECT return_id AS returnId, status
            FROM returns
            WHERE order_id = ?
            ORDER BY return_id DESC
            LIMIT 1
            `,
            [orderId]
        );

        let returnId;

        if (existingReturns.length > 0) {
            if (existingReturns[0].status === 'APPROVED') {
                await connection.rollback();
                return res.status(400).json({ message: 'Yêu cầu đổi trả của đơn này đã được duyệt' });
            }

            returnId = existingReturns[0].returnId;

            await connection.query(
                `
                UPDATE returns
                SET reason = ?,
                    status = 'REQUESTED'
                WHERE return_id = ?
                `,
                [reason, returnId]
            );
        } else {
            const [result] = await connection.query(
                `
                INSERT INTO returns (
                    order_id,
                    user_id,
                    reason,
                    status
                )
                VALUES (?, ?, ?, 'REQUESTED')
                `,
                [orderId, userId, reason]
            );

            returnId = result.insertId;
        }

        await connection.commit();

        res.status(existingReturns.length > 0 ? 200 : 201).json({
            id: formatReturnId(returnId),
            returnId,
            orderId: formatOrderId(orderId),
            reason,
            status: 'pending',
            rawStatus: 'REQUESTED'
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Không thể gửi yêu cầu đổi trả' });
    } finally {
        connection.release();
    }
});

router.post('/', async (req, res) => {
    const orderId = parseOrderId(req.body.orderId);
    const reason = String(req.body.reason || '').trim();
    const decision = req.body.decision === 'rejected' ? 'rejected' : 'approved';
    const status = mapDbReturnStatus(decision);

    if (!orderId) {
        return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ' });
    }

    if (!reason) {
        return res.status(400).json({ message: 'Vui lòng nhập lý do đổi trả' });
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

        if (orders[0].status === 'CANCELLED') {
            await connection.rollback();
            return res.status(400).json({ message: 'Đơn đã hủy không đủ điều kiện đổi trả' });
        }

        const [existingReturns] = await connection.query(
            `
            SELECT return_id AS returnId
            FROM returns
            WHERE order_id = ?
            ORDER BY return_id DESC
            LIMIT 1
            `,
            [orderId]
        );

        let returnId;

        if (existingReturns.length > 0) {
            returnId = existingReturns[0].returnId;

            await connection.query(
                `
                UPDATE returns
                SET reason = ?,
                    status = ?
                WHERE return_id = ?
                `,
                [reason, status, returnId]
            );
        } else {
            const [result] = await connection.query(
                `
                INSERT INTO returns (
                    order_id,
                    user_id,
                    reason,
                    status
                )
                VALUES (?, ?, ?, ?)
                `,
                [orderId, orders[0].userId, reason, status]
            );

            returnId = result.insertId;
        }

        await connection.commit();

        res.status(existingReturns.length > 0 ? 200 : 201).json({
            id: formatReturnId(returnId),
            returnId,
            orderId: formatOrderId(orderId),
            reason,
            status: mapReturnStatus(status),
            rawStatus: status
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Không thể lưu phiếu đổi trả' });
    } finally {
        connection.release();
    }
});

module.exports = router;
