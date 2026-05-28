const express = require('express');
const pool = require('../data/mysql');

const router = express.Router();

let schemaReadyPromise = null;

function formatReviewId(id) {
    return `RVW-${String(id).padStart(4, '0')}`;
}

function formatProductId(id) {
    return `PRD-${String(id).padStart(3, '0')}`;
}

function formatOrderId(id) {
    return id ? `ORD-${id}` : '';
}

function parseReviewId(id) {
    const match = String(id || '').match(/RVW-(\d+)/);
    return Number(match ? match[1] : id);
}

function parseProductId(id) {
    return Number(String(id || '').replace('PRD-', ''));
}

function parseOrderId(id) {
    return Number(String(id || '').replace('ORD-', ''));
}

async function ensureReviewSchema() {
    if (!schemaReadyPromise) {
        schemaReadyPromise = (async () => {
            const [columns] = await pool.query(
                `
                SELECT COLUMN_NAME AS columnName
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'reviews'
                  AND COLUMN_NAME IN ('reply_content', 'reply_user_id', 'replied_at', 'order_id')
                `
            );

            const existingColumns = new Set(columns.map((column) => column.columnName));
            const changes = [];

            if (!existingColumns.has('reply_content')) {
                changes.push('ADD COLUMN reply_content varchar(1000) NULL');
            }

            if (!existingColumns.has('reply_user_id')) {
                changes.push('ADD COLUMN reply_user_id bigint(20) NULL');
            }

            if (!existingColumns.has('replied_at')) {
                changes.push('ADD COLUMN replied_at datetime(6) NULL');
            }

            if (!existingColumns.has('order_id')) {
                changes.push('ADD COLUMN order_id bigint(20) NULL');
                changes.push('ADD INDEX idx_reviews_user_id (user_id)');
                changes.push('DROP INDEX uk_review_user_product');
                changes.push('ADD UNIQUE KEY uk_review_order_product (order_id, product_id)');
            }

            if (changes.length > 0) {
                await pool.query(`ALTER TABLE reviews ${changes.join(', ')}`);
            }
        })();
    }

    return schemaReadyPromise;
}

function mapReview(row) {
    return {
        id: formatReviewId(row.reviewId),
        reviewId: row.reviewId,
        productId: formatProductId(row.productId),
        productName: row.productName,
        userId: row.userId,
        customerName: row.customerName,
        orderId: formatOrderId(row.orderId),
        rating: Number(row.rating || 0),
        content: row.comment,
        date: row.createdAt,
        replyContent: row.replyContent || '',
        replyUserId: row.replyUserId || null,
        replyStaff: row.replyStaff || '',
        repliedAt: row.repliedAt || null,
        status: row.replyContent ? 'replied' : 'pending'
    };
}

async function getReviewById(reviewId) {
    const [rows] = await pool.query(
        `
        SELECT
            r.review_id AS reviewId,
            r.user_id AS userId,
            r.product_id AS productId,
            r.rating,
            r.comment,
            r.created_at AS createdAt,
            r.reply_content AS replyContent,
            r.reply_user_id AS replyUserId,
            r.replied_at AS repliedAt,
            customer.full_name AS customerName,
            p.name AS productName,
            staff.full_name AS replyStaff,
            r.order_id AS orderId
        FROM reviews r
        JOIN users customer ON customer.user_id = r.user_id
        JOIN products p ON p.product_id = r.product_id
        LEFT JOIN users staff ON staff.user_id = r.reply_user_id
        WHERE r.review_id = ?
        `,
        [reviewId]
    );

    return rows[0] ? mapReview(rows[0]) : null;
}

router.get('/', async (req, res) => {
    try {
        await ensureReviewSchema();

        const [rows] = await pool.query(
            `
            SELECT
                r.review_id AS reviewId,
                r.user_id AS userId,
                r.product_id AS productId,
                r.rating,
                r.comment,
                r.created_at AS createdAt,
                r.reply_content AS replyContent,
                r.reply_user_id AS replyUserId,
                r.replied_at AS repliedAt,
                customer.full_name AS customerName,
                p.name AS productName,
                staff.full_name AS replyStaff,
                r.order_id AS orderId
            FROM reviews r
            JOIN users customer ON customer.user_id = r.user_id
            JOIN products p ON p.product_id = r.product_id
            LEFT JOIN users staff ON staff.user_id = r.reply_user_id
            ORDER BY r.created_at DESC, r.review_id DESC
            `
        );

        res.json(rows.map(mapReview));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Không thể tải danh sách đánh giá' });
    }
});

router.get('/user/:userId', async (req, res) => {
    const userId = Number(req.params.userId);

    if (!userId) {
        return res.status(400).json({ message: 'Mã khách hàng không hợp lệ' });
    }

    try {
        await ensureReviewSchema();

        const [rows] = await pool.query(
            `
            SELECT
                r.review_id AS reviewId,
                r.user_id AS userId,
                r.product_id AS productId,
                r.rating,
                r.comment,
                r.created_at AS createdAt,
                r.reply_content AS replyContent,
                r.reply_user_id AS replyUserId,
                r.replied_at AS repliedAt,
                customer.full_name AS customerName,
                p.name AS productName,
                staff.full_name AS replyStaff,
                r.order_id AS orderId
            FROM reviews r
            JOIN users customer ON customer.user_id = r.user_id
            JOIN products p ON p.product_id = r.product_id
            LEFT JOIN users staff ON staff.user_id = r.reply_user_id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC, r.review_id DESC
            `,
            [userId]
        );

        res.json(rows.map(mapReview));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Không thể tải đánh giá của khách hàng' });
    }
});

router.get('/product/:id', async (req, res) => {
    const productId = parseProductId(req.params.id);

    if (!productId) {
        return res.status(400).json({ message: 'Mã sản phẩm không hợp lệ' });
    }

    try {
        await ensureReviewSchema();

        const [rows] = await pool.query(
            `
            SELECT
                r.review_id AS reviewId,
                r.user_id AS userId,
                r.product_id AS productId,
                r.rating,
                r.comment,
                r.created_at AS createdAt,
                r.reply_content AS replyContent,
                r.reply_user_id AS replyUserId,
                r.replied_at AS repliedAt,
                customer.full_name AS customerName,
                p.name AS productName,
                staff.full_name AS replyStaff,
                r.order_id AS orderId
            FROM reviews r
            JOIN users customer ON customer.user_id = r.user_id
            JOIN products p ON p.product_id = r.product_id
            LEFT JOIN users staff ON staff.user_id = r.reply_user_id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC, r.review_id DESC
            `,
            [productId]
        );

        res.json(rows.map(mapReview));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Không thể tải đánh giá sản phẩm' });
    }
});

router.post('/', async (req, res) => {
    const userId = Number(req.body.userId);
    const orderId = parseOrderId(req.body.orderId);
    const productId = parseProductId(req.body.productId);
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || '').trim();

    if (!userId || !productId || !orderId) {
        return res.status(400).json({ message: 'Thiếu thông tin khách hàng, đơn hàng hoặc sản phẩm' });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Số sao đánh giá phải từ 1 đến 5' });
    }

    if (!comment) {
        return res.status(400).json({ message: 'Vui lòng nhập nội dung đánh giá' });
    }

    if (comment.length > 1000) {
        return res.status(400).json({ message: 'Nội dung đánh giá không được vượt quá 1000 ký tự' });
    }

    try {
        await ensureReviewSchema();

        const [users] = await pool.query(
            `
            SELECT u.user_id AS userId, r.role_name AS roleName
            FROM users u
            JOIN roles r ON r.role_id = u.role_id
            WHERE u.user_id = ?
              AND u.is_active = 1
            `,
            [userId]
        );

        if (users.length === 0 || users[0].roleName !== 'CUSTOMER') {
            return res.status(403).json({ message: 'Chỉ khách hàng mới được gửi đánh giá' });
        }

        const [products] = await pool.query(
            `
            SELECT product_id AS productId
            FROM products
            WHERE product_id = ?
            `,
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm cần đánh giá' });
        }

        const [purchasedProducts] = await pool.query(
            `
            SELECT o.order_id AS orderId
            FROM orders o
            JOIN order_details od ON od.order_id = o.order_id
            JOIN product_variants pv ON pv.variant_id = od.variant_id
            LEFT JOIN returns r ON r.order_id = o.order_id
            WHERE o.order_id = ?
              AND o.user_id = ?
              AND pv.product_id = ?
              AND o.status = 'DELIVERED'
              AND (r.return_id IS NULL OR r.status = 'REJECTED')
            LIMIT 1
            `,
            [orderId, userId, productId]
        );

        if (purchasedProducts.length === 0) {
            return res.status(403).json({ message: 'Bạn chỉ có thể đánh giá sản phẩm đã mua và đã giao thành công' });
        }

        const [existingReviews] = await pool.query(
            `
            SELECT review_id AS reviewId
            FROM reviews
            WHERE order_id = ?
              AND product_id = ?
            LIMIT 1
            `,
            [orderId, productId]
        );

        if (existingReviews.length > 0) {
            return res.status(409).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
        }

        await pool.query(
            `
            INSERT INTO reviews (
                user_id,
                order_id,
                product_id,
                rating,
                comment,
                reply_content,
                reply_user_id,
                replied_at
            )
            VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL)
            `,
            [userId, orderId, productId, rating, comment]
        );

        const [reviews] = await pool.query(
            `
            SELECT review_id AS reviewId
            FROM reviews
            WHERE order_id = ?
              AND product_id = ?
            `,
            [orderId, productId]
        );

        const review = await getReviewById(reviews[0].reviewId);

        res.status(201).json(review);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
        }

        console.error(error);
        res.status(500).json({ message: 'Không thể lưu đánh giá' });
    }
});

router.patch('/:id/reply', async (req, res) => {
    const reviewId = parseReviewId(req.params.id);
    const userId = Number(req.body.userId);
    const replyContent = String(req.body.replyContent || '').trim();

    if (!reviewId || !userId) {
        return res.status(400).json({ message: 'Thiếu thông tin đánh giá hoặc nhân viên phản hồi' });
    }

    if (!replyContent) {
        return res.status(400).json({ message: 'Vui lòng nhập nội dung phản hồi' });
    }

    if (replyContent.length > 1000) {
        return res.status(400).json({ message: 'Nội dung phản hồi không được vượt quá 1000 ký tự' });
    }

    try {
        await ensureReviewSchema();

        const [staffUsers] = await pool.query(
            `
            SELECT u.user_id AS userId, r.role_name AS roleName
            FROM users u
            JOIN roles r ON r.role_id = u.role_id
            WHERE u.user_id = ?
              AND u.is_active = 1
            `,
            [userId]
        );

        if (staffUsers.length === 0 || !['SALE', 'MANAGER'].includes(staffUsers[0].roleName)) {
            return res.status(403).json({ message: 'Chỉ nhân viên bán hàng hoặc quản lý mới được phản hồi đánh giá' });
        }

        const [result] = await pool.query(
            `
            UPDATE reviews
            SET
                reply_content = ?,
                reply_user_id = ?,
                replied_at = CURRENT_TIMESTAMP(6)
            WHERE review_id = ?
            `,
            [replyContent, userId, reviewId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá cần phản hồi' });
        }

        const review = await getReviewById(reviewId);

        res.json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Không thể lưu phản hồi đánh giá' });
    }
});

module.exports = router;
