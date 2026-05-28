const express = require('express');
const pool = require('../data/mysql');

const router = express.Router();

function formatProductId(id) {
    return `PRD-${String(id).padStart(3, '0')}`;
}

function formatVariantId(id) {
    return `VAR-${String(id).padStart(3, '0')}`;
}

function parseProductId(id) {
    return Number(String(id).replace('PRD-', ''));
}

function parseVariantId(id) {
    return Number(String(id).replace('VAR-', ''));
}

function mapProduct(row, variants = []) {
    const stock = variants.reduce((sum, item) => sum + Number(item.stock || 0), 0);

    return {
        id: formatProductId(row.productId),
        productId: row.productId,
        sku: formatProductId(row.productId),
        name: row.name,
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        price: Number(row.price),
        description: row.description,
        status: row.isActive ? 'active' : 'draft',
        stock,
        image: '',
        variants
    };
}

router.get('/', async (req, res) => {
    const [products] = await pool.query(`
        SELECT
            p.product_id AS productId,
            p.name,
            p.category_id AS categoryId,
            c.name AS categoryName,
            p.price,
            p.description,
            p.is_active AS isActive
        FROM products p
        JOIN categories c ON c.category_id = p.category_id
        ORDER BY p.product_id DESC
    `);

    const [variants] = await pool.query(`
        SELECT
            variant_id AS variantId,
            product_id AS productId,
            color,
            size,
            stock,
            is_active AS isActive
        FROM product_variants
        ORDER BY variant_id
    `);

    const result = products.map((product) => {
        const productVariants = variants
            .filter((variant) => variant.productId === product.productId)
            .map((variant) => ({
                id: formatVariantId(variant.variantId),
                variantId: variant.variantId,
                productId: formatProductId(variant.productId),
                color: variant.color,
                size: variant.size,
                stock: Number(variant.stock),
                isActive: Boolean(variant.isActive),
                status: variant.isActive ? 'active' : 'draft'
            }));

        return mapProduct(product, productVariants);
    });

    res.json(result);
});

router.get('/categories', async (req, res) => {
    const [categories] = await pool.query(`
        SELECT
            category_id AS categoryId,
            name,
            is_active AS isActive
        FROM categories
        ORDER BY category_id
    `);
    res.json(categories.map((category) => ({
        categoryId: category.categoryId,
        id: `CAT-${String(category.categoryId).padStart(2, '0')}`,
        name: category.name,
        isActive: Boolean(category.isActive),
        status: category.isActive ? 'active' : 'draft'
    })));
});
router.get('/public', async (req, res) => {
    const [products] = await pool.query(`
        SELECT
            p.product_id AS productId,
            p.name,
            p.category_id AS categoryId,
            c.name AS categoryName,
            p.price,
            p.description,
            p.is_active AS isActive
        FROM products p
        JOIN categories c ON c.category_id = p.category_id
        WHERE p.is_active = 1
        AND c.is_active = 1
        ORDER BY p.product_id DESC
    `);

    const [variants] = await pool.query(`
        SELECT
            variant_id AS variantId,
            product_id AS productId,
            color,
            size,
            stock,
            is_active AS isActive
        FROM product_variants
        WHERE is_active = 1
        ORDER BY variant_id
    `);

    const result = products.map((product) => {
        const productVariants = variants
            .filter((variant) => variant.productId === product.productId)
            .map((variant) => ({
                id: formatVariantId(variant.variantId),
                variantId: variant.variantId,
                productId: formatProductId(variant.productId),
                color: variant.color,
                size: variant.size,
                stock: Number(variant.stock)
            }));

        return mapProduct(product, productVariants);
    });

    res.json(result);
});
router.get('/public/:id', async (req, res) => {
    const productId = parseProductId(req.params.id);

    const [products] = await pool.query(`
        SELECT
            p.product_id AS productId,
            p.name,
            p.category_id AS categoryId,
            c.name AS categoryName,
            p.price,
            p.description,
            p.is_active AS isActive
        FROM products p
        JOIN categories c ON c.category_id = p.category_id
        WHERE p.product_id = ?
          AND p.is_active = 1
          AND c.is_active = 1
    `, [productId]);

    if (products.length === 0) {
        return res.status(404).json({ message: 'Sản phẩm này hiện ngừng bán' });
    }

    const [variants] = await pool.query(`
        SELECT
            variant_id AS variantId,
            product_id AS productId,
            color,
            size,
            stock,
            is_active AS isActive
        FROM product_variants
        WHERE product_id = ?
          AND is_active = 1
        ORDER BY variant_id
    `, [productId]);

    const productVariants = variants.map((variant) => ({
        id: formatVariantId(variant.variantId),
        variantId: variant.variantId,
        productId: formatProductId(variant.productId),
        color: variant.color,
        size: variant.size,
        stock: Number(variant.stock),
        isActive: Boolean(variant.isActive),
        status: variant.isActive ? 'active' : 'draft'
    }));

    res.json(mapProduct(products[0], productVariants));
});
router.get('/:id', async (req, res) => {
    const productId = parseProductId(req.params.id);

    const [products] = await pool.query(`
        SELECT
            p.product_id AS productId,
            p.name,
            p.category_id AS categoryId,
            c.name AS categoryName,
            p.price,
            p.description,
            p.is_active AS isActive
        FROM products p
        JOIN categories c ON c.category_id = p.category_id
        WHERE p.product_id = ?
    `, [productId]);

    if (products.length === 0) {
        return res.status(404).json({ message: 'Khong tim thay san pham' });
    }

    const [variants] = await pool.query(`
        SELECT
            variant_id AS variantId,
            product_id AS productId,
            color,
            size,
            stock,
            is_active AS isActive
        FROM product_variants
        WHERE product_id = ?
        ORDER BY variant_id
    `, [productId]);

    const productVariants = variants.map((variant) => ({
        id: formatVariantId(variant.variantId),
        variantId: variant.variantId,
        productId: formatProductId(variant.productId),
        color: variant.color,
        size: variant.size,
        stock: Number(variant.stock),
        isActive: Boolean(variant.isActive),
        status: variant.isActive ? 'active' : 'draft'
    }));

    res.json(mapProduct(products[0], productVariants));
});
router.post('/', async (req, res) => {
    const { name, categoryId, price, description, isActive, variants } = req.body;

    if (!name || !categoryId || !price || !description) {
        return res.status(400).json({ message: 'Thiếu thông tin sản phâm' });
    }

    if (!Array.isArray(variants) || variants.length === 0) {
        return res.status(400).json({ message: 'Sản phầm cần có ít nhất 1 loại' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [productResult] = await connection.query(
            `
            INSERT INTO products (
                name,
                category_id,
                price,
                description,
                is_active
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                name,
                categoryId,
                price,
                description,
                isActive ? 1 : 0
            ]
        );

        const productId = productResult.insertId;

        for (const variant of variants) {
            await connection.query(
                `
                INSERT INTO product_variants (
                    product_id,
                    color,
                    size,
                    stock,
                    is_active
                )
                VALUES (?, ?,?, ?, ?)
                `,
                [
                    productId,
                    variant.color,
                    variant.size,
                    0,
                    variant.isActive === false ? 0 : 1
                ]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: 'Tạo sản phẩm thành công',
            id: `PRD-${String(productId).padStart(3, '0')}`,
            productId
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Không thể tạo sản phẩm' });
    } finally {
        connection.release();
    }
});
router.put('/:id', async (req, res) => {
    const productId = parseProductId(req.params.id);
    const { name, categoryId, price, description, isActive, variants } = req.body;

    if (!name || !categoryId || !price || !description) {
        return res.status(400).json({ message: 'Thiếu thông tin sản phẩm' });
    }

    if (!Array.isArray(variants) || variants.length === 0) {
        return res.status(400).json({ message: 'Sản phẩm ít nhất có 1 loại' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [productResult] = await connection.query(
            `
            UPDATE products
            SET
                name = ?,
                category_id = ?,
                price = ?,
                description = ?,
                is_active = ?
            WHERE product_id = ?
            `,
            [
                name,
                categoryId,
                price,
                description,
                isActive ? 1 : 0,
                productId
            ]
        );

        if (productResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        for (const variant of variants) {
            if (!variant.color || !variant.size) {
                await connection.rollback();
                return res.status(400).json({ message: 'Bien the can co mau sac va kich co' });
            }

            const variantId = variant.variantId || variant.id ? parseVariantId(variant.variantId || variant.id) : null;

            if (variantId) {
                const [variantResult] = await connection.query(
                    `
                    UPDATE product_variants
                    SET
                        color = ?,
                        size = ?,
                        is_active = ?
                    WHERE variant_id = ?
                      AND product_id = ?
                    `,
                    [
                        variant.color,
                        variant.size,
                        variant.isActive === false ? 0 : 1,
                        variantId,
                        productId
                    ]
                );

                if (variantResult.affectedRows > 0) {
                    continue;
                }
            }

            await connection.query(
                `
                INSERT INTO product_variants (
                    product_id,
                    color,
                    size,
                    stock,
                    is_active
                )
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    color = VALUES(color),
                    size = VALUES(size),
                    is_active = VALUES(is_active)
                `,
                [
                    productId,
                    variant.color,
                    variant.size,
                    0,
                    variant.isActive === false ? 0 : 1
                ]
            );
        }

        await connection.commit();

        res.json({
            message: 'Cập nhật sản phẩm thành công',
            id: `PRD-${String(productId).padStart(3, '0')}`,
            productId
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Không thể cập nhật sản phẩm' });
    } finally {
        connection.release();
    }
});
router.patch('/:id/status', async (req, res) => {
    const productId = parseProductId(req.params.id);
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive phai la boolean' });
    }

    const [result] = await pool.query(
        `
        UPDATE products
        SET is_active = ?
        WHERE product_id = ?
        `,
        [isActive ? 1 : 0, productId]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Khong tim thay san pham' });
    }

    res.json({
        message: 'Cap nhat trang thai san pham thanh cong',
        id: `PRD-${String(productId).padStart(3, '0')}`,
        isActive
    });
});
router.post('/categories', async (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Ten danh muc khong duoc de trong' });
    }

    try {
        const [result] = await pool.query(
            `
            INSERT INTO categories (name)
            VALUES (?)
            `,
            [name.trim()]
        );

        res.status(201).json({
            message: 'Tao danh muc thanh cong',
            category: {
                categoryId: result.insertId,
                name: name.trim()
            }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Danh muc da ton tai' });
        }

        console.error(error);
        res.status(500).json({ message: 'Khong the tao danh muc' });
    }
});

router.put('/categories/:id', async (req, res) => {
    const categoryId = Number(req.params.id);
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Ten danh muc khong duoc de trong' });
    }

    try {
        const [result] = await pool.query(
            `
            UPDATE categories
            SET name = ?
            WHERE category_id = ?
            `,
            [name.trim(), categoryId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Khong tim thay danh muc' });
        }

        res.json({
            message: 'Cap nhat danh muc thanh cong',
            category: {
                categoryId,
                name: name.trim()
            }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Danh muc da ton tai' });
        }

        console.error(error);
        res.status(500).json({ message: 'Khong the cap nhat danh muc' });
    }
});

router.delete('/categories/:id', async (req, res) => {
    const categoryId = Number(req.params.id);

    const [usedProducts] = await pool.query(
        `
        SELECT COUNT(*) AS usedCount
        FROM products
        WHERE category_id = ?
        `,
        [categoryId]
    );

    if (Number(usedProducts[0].usedCount) > 0) {
        return res.status(400).json({
            message: 'Danh muc dang co san pham, khong the xoa'
        });
    }

    const [result] = await pool.query(
        `
        DELETE FROM categories
        WHERE category_id = ?
        `,
        [categoryId]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Khong tim thay danh muc' });
    }

    res.json({ message: 'Xoa danh muc thanh cong' });
});
router.patch('/categories/:id/status', async (req, res) => {
    const categoryId = Number(req.params.id);
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive phai la boolean' });
    }

    const [result] = await pool.query(
        `
        UPDATE categories
        SET is_active = ?
        WHERE category_id = ?
        `,
        [isActive ? 1 : 0, categoryId]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    res.json({
        message: 'Cập nhật trạng thái danh mục thành công',
        categoryId,
        isActive,
        status: isActive ? 'active' : 'draft'
    });
});
module.exports = router;
