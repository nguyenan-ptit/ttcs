const express = require('express');
const pool = require('../data/mysql');

const router = express.Router();
function mapStore(row) {
    return {
        storeId: row.storeId,
        name: row.name,
        manager: row.manager,
        phone: row.phone,
        hotline: row.hotline || '',
        email: row.email || '',
        openHours: row.openHours || '',
        address: row.address || '',
        facebook: row.facebook || '',
        instagram: row.instagram || '',
        description: row.description || '',
        policy: row.policy || ''
    };
}
function validateStorePayload(body) {
    const data = {
        name: String(body.name || '').trim(),
        manager: String(body.manager || '').trim(),
        phone: String(body.phone || '').trim(),
        hotline: String(body.hotline || '').trim(),
        email: String(body.email || '').trim(),
        openHours: String(body.openHours || '').trim(),
        address: String(body.address || '').trim(),
        facebook: String(body.facebook || '').trim(),
        instagram: String(body.instagram || '').trim(),
        description: String(body.description || '').trim(),
        policy: String(body.policy || '').trim()
    };

    if (!data.name || !data.manager || !data.phone || !data.openHours || !data.address) {
        return { error: 'Thiếu thông tin cửa hàng' };
    }

    return { data };
}
router.get('/', async (req, res) => {
    const [rows] = await pool.query(`
        SELECT
            store_id AS storeId,
            name,
            manager,
            phone,
            hotline,
            email,
            open_hours AS openHours,
            address,
            facebook,
            instagram,
            description,
            policy
        FROM store_info
        ORDER BY store_id
        LIMIT 1
    `);

    if (rows.length === 0) {
        return res.status(404).json({ message: 'Chưa có thông tin cửa hàng' });
    }

    res.json(mapStore(rows[0]));
});
router.put('/', async (req, res) => {
    const { error, data } = validateStorePayload(req.body);

    if (error) {
        return res.status(400).json({ message: error });
    }

    const [existingRows] = await pool.query(`
        SELECT store_id AS storeId
        FROM store_info
        ORDER BY store_id
        LIMIT 1
    `);

    if (existingRows.length === 0) {
        const [result] = await pool.query(
            `
            INSERT INTO store_info (
                name,
                manager,
                phone,
                hotline,
                email,
                open_hours,
                address,
                facebook,
                instagram,
                description,
                policy
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                data.name,
                data.manager,
                data.phone,
                data.hotline,
                data.email,
                data.openHours,
                data.address,
                data.facebook,
                data.instagram,
                data.description,
                data.policy
            ]
        );

        return res.status(201).json({
            message: 'Tạo thông tin cửa hàng thành công',
            store: {
                storeId: result.insertId,
                ...data
            }
        });
    }

    const storeId = existingRows[0].storeId;

    await pool.query(
        `
        UPDATE store_info
        SET
            name = ?,
            manager = ?,
            phone = ?,
            hotline = ?,
            email = ?,
            open_hours = ?,
            address = ?,
            facebook = ?,
            instagram = ?,
            description = ?,
            policy = ?
        WHERE store_id = ?
        `,
        [
            data.name,
            data.manager,
            data.phone,
            data.hotline,
            data.email,
            data.openHours,
            data.address,
            data.facebook,
            data.instagram,
            data.description,
            data.policy,
            storeId
        ]
    );

    res.json({
        message: 'Cập nhật thông tin cửa hàng thành công',
        store: {
            storeId,
            ...data
        }
    });
});
module.exports = router;