const express = require('express');
const pool = require('../data/mysql');

const router = express.Router();

function formatProductId(id) {
    return `PRD-${String(id).padStart(3, '0')}`;
}

function formatVariantId(id) {
    return `VAR-${String(id).padStart(3, '0')}`;
}

function formatLogId(id) {
    return `LOG-${String(id).padStart(4, '0')}`;
}

function formatReturnId(id) {
    return `RTN-${String(id).padStart(4, '0')}`;
}

function parseProductId(id) {
    return Number(String(id).replace('PRD-', ''));
}

function parseVariantId(id) {
    return Number(String(id).replace('VAR-', ''));
}

function parseReturnId(id) {
    const match = String(id || '').match(/RTN-(\d+)/);
    return Number(match ? match[1] : id);
}

function parsePositiveInteger(value, fieldName) {
    const number = Number(value);

    if (!Number.isInteger(number) || number <= 0) {
        throw new Error(`${fieldName} phải là số nguyên lớn hơn 0`);
    }

    return number;
}

function parseZeroOrPositiveInteger(value, fieldName) {
    const number = Number(value);

    if (!Number.isInteger(number) || number < 0) {
        throw new Error(`${fieldName} phải là số nguyên không âm`);
    }

    return number;
}

function mapLogType(type, quantity) {
    const signedQuantity = Number(quantity || 0);

    const meta = {
        IMPORT: {
            reason: 'Nhập kho',
            delta: signedQuantity
        },
        ADJUSTMENT_IN: {
            reason: 'Kiểm kê tăng tồn',
            delta: signedQuantity
        },
        ADJUSTMENT_OUT: {
            reason: 'Kiểm kê giảm tồn',
            delta: -signedQuantity
        },
        ORDER_CANCEL_RETURN: {
            reason: 'Hoàn kho đơn huỷ',
            delta: signedQuantity
        },
        ORDER_OUT: {
            reason: 'Xuất kho đơn hàng',
            delta: -signedQuantity
        }
    };

    return meta[type] || {
        reason: type,
        delta: signedQuantity
    };
}

function mapCustomerReturnStatus(status, isReceived = false) {
    if (status === 'REJECTED') {
        return 'rejected';
    }

    if (isReceived) {
        return 'completed';
    }

    if (status === 'APPROVED') {
        return 'pending';
    }

    return 'waiting_approval';
}

router.get('/products', async (req, res) => {
    const [rows] = await pool.query(`
        SELECT
            p.product_id AS productId,
            p.name AS productName,
            p.price,
            p.is_active AS productIsActive,
            pv.variant_id AS variantId,
            pv.color,
            pv.size,
            pv.stock,
            pv.is_active AS variantIsActive
        FROM products p
        LEFT JOIN product_variants pv ON pv.product_id = p.product_id
        ORDER BY p.product_id DESC, pv.variant_id
    `);

    const productsById = new Map();

    for (const row of rows) {
        if (!productsById.has(row.productId)) {
            productsById.set(row.productId, {
                id: formatProductId(row.productId),
                productId: row.productId,
                sku: formatProductId(row.productId),
                name: row.productName,
                price: Number(row.price || 0),
                isActive: Boolean(row.productIsActive),
                status: row.productIsActive ? 'active' : 'draft',
                stock: 0,
                variants: []
            });
        }

        const product = productsById.get(row.productId);

        if (!row.variantId) {
            continue;
        }

        const variant = {
            id: formatVariantId(row.variantId),
            variantId: row.variantId,
            productId: formatProductId(row.productId),
            color: row.color,
            size: row.size,
            stock: Number(row.stock || 0),
            isActive: Boolean(row.variantIsActive),
            status: row.variantIsActive ? 'active' : 'draft'
        };

        product.stock += variant.stock;
        product.variants.push(variant);
    }

    res.json([...productsById.values()]);
});

router.get('/logs', async (req, res) => {
    const [logs] = await pool.query(`
        SELECT
            il.log_id AS logId,
            il.type,
            il.quantity,
            il.created_at AS createdAt,
            u.full_name AS staff,
            p.product_id AS productId,
            p.name AS productName,
            pv.variant_id AS variantId,
            pv.color,
            pv.size
        FROM inventory_logs il
        JOIN product_variants pv ON pv.variant_id = il.variant_id
        JOIN products p ON p.product_id = pv.product_id
        JOIN users u ON u.user_id = il.user_id
        ORDER BY il.created_at DESC, il.log_id DESC
        LIMIT 20
    `);

    res.json(logs.map((log) => {
        const meta = mapLogType(log.type, log.quantity);

        return {
            id: formatLogId(log.logId),
            logId: log.logId,
            date: log.createdAt,
            productId: formatProductId(log.productId),
            productName: log.productName,
            variantId: formatVariantId(log.variantId),
            variantLabel: `${log.color} / ${log.size}`,
            quantity: Number(log.quantity || 0),
            delta: meta.delta,
            reason: meta.reason,
            type: log.type,
            staff: log.staff
        };
    }));
});

router.post('/imports', async (req, res) => {
    const variantId = parseVariantId(req.body.variantId);
    const userId = Number(req.body.userId);

    let quantity;

    try {
        quantity = parsePositiveInteger(req.body.quantity, 'Số lượng nhập');
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }

    if (!variantId || !userId) {
        return res.status(400).json({ message: 'Thiếu thông tin biến thể hoặc nhân viên kho' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [variants] = await connection.query(`
            SELECT
                pv.variant_id AS variantId,
                pv.stock,
                pv.color,
                pv.size,
                p.product_id AS productId,
                p.name AS productName
            FROM product_variants pv
            JOIN products p ON p.product_id = pv.product_id
            WHERE pv.variant_id = ?
            FOR UPDATE
        `, [variantId]);

        if (variants.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy biến thể sản phẩm' });
        }

        const variant = variants[0];
        const beforeStock = Number(variant.stock || 0);
        const afterStock = beforeStock + quantity;

        await connection.query(
            `
            UPDATE product_variants
            SET stock = ?
            WHERE variant_id = ?
            `,
            [afterStock, variantId]
        );

        const [logResult] = await connection.query(
            `
            INSERT INTO inventory_logs (
                variant_id,
                user_id,
                type,
                quantity
            )
            VALUES (?, ?, 'IMPORT', ?)
            `,
            [variantId, userId, quantity]
        );

        await connection.commit();

        res.status(201).json({
            id: formatLogId(logResult.insertId),
            logId: logResult.insertId,
            productId: formatProductId(variant.productId),
            productName: variant.productName,
            variantId: formatVariantId(variant.variantId),
            variantLabel: `${variant.color} / ${variant.size}`,
            beforeStock,
            afterStock,
            quantity,
            delta: quantity,
            reason: 'Nhập kho'
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Không thể ghi nhận nhập kho' });
    } finally {
        connection.release();
    }
});

router.post('/audits', async (req, res) => {
    const productId = parseProductId(req.body.productId);
    const userId = Number(req.body.userId);
    const items = req.body.items;

    if (!productId || !userId) {
        return res.status(400).json({ message: 'Thiếu thông tin sản phẩm hoặc nhân viên kho' });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Không có biến thể nào để cập nhật' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const changedVariants = [];

        for (const item of items) {
            const variantId = parseVariantId(item.variantId);
            const actualStock = parseZeroOrPositiveInteger(item.actualStock, 'Số lượng thực tế');

            if (!variantId) {
                await connection.rollback();
                return res.status(400).json({ message: 'Mã biến thể không hợp lệ' });
            }

            const [variants] = await connection.query(`
                SELECT
                    pv.variant_id AS variantId,
                    pv.stock,
                    pv.color,
                    pv.size,
                    p.product_id AS productId,
                    p.name AS productName
                FROM product_variants pv
                JOIN products p ON p.product_id = pv.product_id
                WHERE pv.variant_id = ?
                  AND pv.product_id = ?
                FOR UPDATE
            `, [variantId, productId]);

            if (variants.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Không tìm thấy biến thể sản phẩm cần cập nhật' });
            }

            const variant = variants[0];
            const beforeStock = Number(variant.stock || 0);
            const delta = actualStock - beforeStock;

            if (delta === 0) {
                continue;
            }

            await connection.query(
                `
                UPDATE product_variants
                SET stock = ?
                WHERE variant_id = ?
                `,
                [actualStock, variantId]
            );

            const logType = delta > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';

            const [logResult] = await connection.query(
                `
                INSERT INTO inventory_logs (
                    variant_id,
                    user_id,
                    type,
                    quantity
                )
                VALUES (?, ?, ?, ?)
                `,
                [variantId, userId, logType, Math.abs(delta)]
            );

            changedVariants.push({
                id: formatLogId(logResult.insertId),
                logId: logResult.insertId,
                productId: formatProductId(variant.productId),
                productName: variant.productName,
                variantId: formatVariantId(variant.variantId),
                variantLabel: `${variant.color} / ${variant.size}`,
                beforeStock,
                afterStock: actualStock,
                delta,
                reason: delta > 0 ? 'Kiểm kê tăng tồn' : 'Kiểm kê giảm tồn'
            });
        }

        await connection.commit();

        res.json({
            updatedCount: changedVariants.length,
            changedVariants
        });
    } catch (error) {
        await connection.rollback();

        if (error.message && error.message.includes('phải là số nguyên')) {
            return res.status(400).json({ message: error.message });
        }

        console.error(error);
        res.status(500).json({ message: 'Không thể cập nhật tồn kho' });
    } finally {
        connection.release();
    }
});

router.get('/customer-returns', async (req, res) => {
    const [rows] = await pool.query(`
        SELECT
            r.return_id AS returnId,
            r.order_id AS orderId,
            r.reason,
            r.status,
            r.created_at AS createdAt,
            o.receiver_name AS receiverName,
            u.full_name AS customerName,
            od.quantity,
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
        WHERE r.status = 'APPROVED'
        ORDER BY r.created_at DESC, r.return_id DESC, od.order_detail_id
    `);

    res.json(rows.map((row) => {
        const returnId = formatReturnId(row.returnId);
        const variantId = formatVariantId(row.variantId);

        return {
            id: `${returnId}-${variantId}`,
            returnId,
            returnIdNumber: row.returnId,
            orderId: `ORD-${row.orderId}`,
            source: row.receiverName || row.customerName,
            productId: formatProductId(row.productId),
            productName: row.productName,
            variantId,
            variantLabel: `${row.color} / ${row.size}`,
            qty: Number(row.quantity || 0),
            reason: row.reason,
            note: '',
            date: row.createdAt,
            status: mapCustomerReturnStatus(row.status, Boolean(row.isReceived)),
            rawStatus: row.status
        };
    }));
});

router.post('/customer-returns/receive', async (req, res) => {
    const variantId = parseVariantId(req.body.variantId);
    const returnId = req.body.returnId ? parseReturnId(req.body.returnId) : null;
    const userId = Number(req.body.userId);
    const source = String(req.body.source || '').trim();
    const reason = String(req.body.reason || '').trim();

    let quantity;

    try {
        quantity = parsePositiveInteger(req.body.quantity, 'Số lượng nhận lại');
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }

    if (!variantId || !userId) {
        return res.status(400).json({ message: 'Thiếu thông tin biến thể hoặc nhân viên kho' });
    }

    if (!source || !reason) {
        return res.status(400).json({ message: 'Vui lòng nhập thông tin khách hàng/mã đơn và lý do đổi trả' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [variants] = await connection.query(`
            SELECT
                pv.variant_id AS variantId,
                pv.stock,
                pv.color,
                pv.size,
                p.product_id AS productId,
                p.name AS productName
            FROM product_variants pv
            JOIN products p ON p.product_id = pv.product_id
            WHERE pv.variant_id = ?
            FOR UPDATE
        `, [variantId]);

        if (variants.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy biến thể sản phẩm cần nhận lại' });
        }

        if (returnId) {
            const [returns] = await connection.query(
                `
                SELECT
                    r.return_id AS returnId,
                    r.status,
                    od.quantity AS expectedQuantity,
                    EXISTS (
                        SELECT 1
                        FROM inventory_logs il
                        JOIN users log_user ON log_user.user_id = il.user_id
                        JOIN roles log_role ON log_role.role_id = log_user.role_id
                        WHERE il.variant_id = ?
                          AND il.type = 'ORDER_CANCEL_RETURN'
                          AND log_role.role_name = 'WAREHOUSE'
                          AND il.quantity >= od.quantity
                          AND il.created_at >= r.created_at
                    ) AS isReceived
                FROM returns r
                JOIN order_details od ON od.order_id = r.order_id
                    AND od.variant_id = ?
                WHERE r.return_id = ?
                FOR UPDATE
                `,
                [variantId, variantId, returnId]
            );

            if (returns.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Không tìm thấy phiếu đổi trả' });
            }

            if (returns[0].status === 'REJECTED') {
                await connection.rollback();
                return res.status(400).json({ message: 'Phiếu đổi trả đã bị từ chối' });
            }

            if (returns[0].status !== 'APPROVED') {
                await connection.rollback();
                return res.status(400).json({ message: 'Phiếu đổi trả chưa được Sale duyệt' });
            }

            if (Boolean(returns[0].isReceived)) {
                await connection.rollback();
                return res.status(400).json({ message: 'Sản phẩm trong phiếu đổi trả này đã được nhập lại kho' });
            }

            if (quantity !== Number(returns[0].expectedQuantity || 0)) {
                await connection.rollback();
                return res.status(400).json({ message: 'Số lượng nhận lại phải khớp với số lượng trong phiếu đổi trả' });
            }
        }

        const variant = variants[0];
        const beforeStock = Number(variant.stock || 0);
        const afterStock = beforeStock + quantity;

        await connection.query(
            `
            UPDATE product_variants
            SET stock = ?
            WHERE variant_id = ?
            `,
            [afterStock, variantId]
        );

        const [logResult] = await connection.query(
            `
            INSERT INTO inventory_logs (
                variant_id,
                user_id,
                type,
                quantity
            )
            VALUES (?, ?, 'ORDER_CANCEL_RETURN', ?)
            `,
            [variantId, userId, quantity]
        );

        if (returnId) {
            await connection.query(
                `
                UPDATE returns
                SET status = 'APPROVED'
                WHERE return_id = ?
                `,
                [returnId]
            );
        }

        await connection.commit();

        res.status(201).json({
            id: returnId ? formatReturnId(returnId) : formatLogId(logResult.insertId),
            logId: logResult.insertId,
            returnId: returnId ? formatReturnId(returnId) : null,
            productId: formatProductId(variant.productId),
            productName: variant.productName,
            variantId: formatVariantId(variant.variantId),
            variantLabel: `${variant.color} / ${variant.size}`,
            beforeStock,
            afterStock,
            quantity,
            delta: quantity,
            reason: 'Nhận hàng đổi trả',
            status: 'completed'
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Không thể xác nhận nhận hàng đổi trả' });
    } finally {
        connection.release();
    }
});

module.exports = router;
