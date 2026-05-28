const express = require('express');
const pool = require('../data/mysql');

const router = express.Router();


function formatPromotionId(id) {
    return `PRM-${String(id).padStart(2, '0')}`;
}
function parsePromotionId(id) {
    return Number(String(id).replace('PRM-', ''));
}
function toDateInputValue(value) {
    if (!value) return '';
    return new Date(value).toISOString().slice(0, 10);
}
function mapPromotion(row) {
    return {
        promotionId: row.promotionId,
        id: formatPromotionId(row.promotionId),
        name: row.name,
        code: row.code,
        type: row.type,
        value: Number(row.value),
        start: toDateInputValue(row.startDate),
        end: toDateInputValue(row.endDate),
        status: row.status
    };
}
const allowedTypes = ['percent', 'fixed', 'gift'];
const allowedStatuses = ['active', 'scheduled', 'ended'];

function validatePromotionPayload(body) {
    const name = String(body.name || '').trim();
    const code = String(body.code || '').trim().toUpperCase();
    const type = body.type;
    const value = Number(body.value);
    const start = body.start;
    const end = body.end;
    const status = body.status;

    if (!name || !code || !type || !start || !end || !status) {
        return { error: 'Thiếu thông tin khuyến mãi' };
    }

    if (!allowedTypes.includes(type)) {
        return { error: 'Loại khuyến mãi không hợp lệ' };
    }

    if (!allowedStatuses.includes(status)) {
        return { error: 'Trạng thái khuyến mãi không hợp lệ' };
    }

    if (!Number.isFinite(value) || value <= 0) {
        return { error: 'Giá trị khuyến mãi phải lớn hơn 0' };
    }

    if (start > end) {
        return { error: 'Ngày bắt đầu không được lớn hơn ngày kết thúc' };
    }

    return {
        data: {
            name,
            code,
            type,
            value,
            start,
            end,
            status
        }
    };
}
router.get('/', async (req, res) => {
    const [rows] = await pool.query(`
        SELECT
            promotion_id AS promotionId,
            name,
            code,
            type,
            value,
            start_date AS startDate,
            end_date AS endDate,
            status
        FROM promotions
        ORDER BY promotion_id DESC
    `);

    res.json(rows.map(mapPromotion));
});
router.post('/', async (req, res) => {
    const { error, data } = validatePromotionPayload(req.body);

    if (error) {
        return res.status(400).json({ message: error });
    }

    try {
        const [result] = await pool.query(
            `
            INSERT INTO promotions (
                name,
                code,
                type,
                value,
                start_date,
                end_date,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                data.name,
                data.code,
                data.type,
                data.value,
                data.start,
                data.end,
                data.status
            ]
        );

        res.status(201).json({
            message: 'Tạo khuyến mãi thành công',
            promotion: {
                promotionId: result.insertId,
                id: formatPromotionId(result.insertId),
                ...data
            }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Mã khuyến mãi đã tồn tại' });
        }

        console.error(error);
        res.status(500).json({ message: 'Không thể tạo khuyến mãi' });
    }
});
router.put('/:id', async (req, res) => {
    const promotionId = parsePromotionId(req.params.id);
    const { error, data } = validatePromotionPayload(req.body);

    if (!promotionId) {
        return res.status(400).json({ message: 'Mã khuyến mãi không hợp lệ' });
    }

    if (error) {
        return res.status(400).json({ message: error });
    }

    try {
        const [result] = await pool.query(
            `
            UPDATE promotions
            SET
                name = ?,
                code = ?,
                type = ?,
                value = ?,
                start_date = ?,
                end_date = ?,
                status = ?
            WHERE promotion_id = ?
            `,
            [
                data.name,
                data.code,
                data.type,
                data.value,
                data.start,
                data.end,
                data.status,
                promotionId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy khuyến mãi' });
        }

        res.json({
            message: 'Cập nhật khuyến mãi thành công',
            promotion: {
                promotionId,
                id: formatPromotionId(promotionId),
                ...data
            }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Mã khuyến mãi đã tồn tại' });
        }

        console.error(error);
        res.status(500).json({ message: 'Không thể cập nhật khuyến mãi' });
    }
});

router.patch('/:id/status', async (req, res) => {
    const promotionId = parsePromotionId(req.params.id);
    const { status } = req.body;

    if (!promotionId) {
        return res.status(400).json({ message: 'Mã khuyến mãi không hợp lệ' });
    }

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Trạng thái khuyến mãi không hợp lệ' });
    }

    const [result] = await pool.query(
        `
        UPDATE promotions
        SET status = ?
        WHERE promotion_id = ?
        `,
        [status, promotionId]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Không tìm thấy khuyến mãi' });
    }

    res.json({
        message: 'Cập nhật trạng thái khuyến mãi thành công',
        promotionId,
        id: formatPromotionId(promotionId),
        status
    });
});
router.get('/verify/:code', async (req, res) => {
    const code = String(req.params.code || '').trim().toUpperCase();

    if (!code) {
        return res.status(400).json({ message: 'Thiếu mã giảm giá' });
    }

    const [rows] = await pool.query(
        `
        SELECT
            promotion_id AS promotionId,
            name,
            code,
            type,
            value,
            start_date AS startDate,
            end_date AS endDate,
            status
        FROM promotions
        WHERE code = ?
        LIMIT 1
        `,
        [code]
    );

    if (rows.length === 0) {
        return res.status(404).json({ message: 'Mã giảm giá không tồn tại' });
    }

    const promo = rows[0];

    if (promo.status === 'ended') {
        return res.status(400).json({ message: 'Mã giảm giá đã kết thúc' });
    }

    const today = new Date().toISOString().slice(0, 10);
    const start = new Date(promo.startDate).toISOString().slice(0, 10);
    const end = new Date(promo.endDate).toISOString().slice(0, 10);

    if (today < start) {
        return res.status(400).json({ message: 'Mã giảm giá chưa bắt đầu' });
    }
    if (today > end) {
        return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
    }

    res.json(mapPromotion(promo));
});

module.exports = router;