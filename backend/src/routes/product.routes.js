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

function getSizesBySizeType(sizeType) {
    return sizeType === 'NUMBER' ? ['28', '29', '30', '31'] : ['S', 'M', 'L', 'XL'];
}

function normalizeSizeType(sizeType) {
    return sizeType === 'NUMBER' ? 'NUMBER' : 'LETTER';
}

function normalizeColorItems(colors, variants) {
    const source = Array.isArray(colors)
        ? colors
        : Array.isArray(variants)
            ? variants.map((variant) => ({
            name: variant.color,
            imageUrl: variant.imageUrl
            }))
            : [];
    const colorMap = new Map();
    for (const item of source) {
            const name = typeof item === 'string'
                ? item.trim()
                : String(item?.name || item?.color || '').trim();

            if (!name) continue;

            const imageUrl = typeof item === 'string'
                ? ''
                : String(item?.imageUrl || '').trim();

            const oldName = typeof item === 'string'
                ? ''
                : String(item?.oldName || '').trim();

            const isActive = typeof item === 'string'
                ? true
                : item?.isActive !== false;

            colorMap.set(name, {
                name,
                oldName,
                imageUrl,
                isActive
            });
    }
    return [...colorMap.values()];
}

function getVariantKey(color, size) {
    return `${String(color || '').trim().toLowerCase()}|${String(size || '').trim().toLowerCase()}`;
}

function buildGeneratedVariants(colorItems, sizes) {
    return colorItems.flatMap((colorItem) =>
        sizes.map((size) => ({
            color: colorItem.name,
            oldColor: colorItem.oldColor || colorItem.oldName,
            isActive: colorItem.isActive,
            size
        }))
    );
}

async function syncProductVariants(connection, productId, colorItems, sizes) {
    const desiredVariants = buildGeneratedVariants(colorItems, sizes);
    const [existingVariants] = await connection.query(
        `
        SELECT
            variant_id AS variantId,
            color,
            size
        FROM product_variants
        WHERE product_id = ?
        ORDER BY variant_id
        `,
        [productId]
    );

    const existingByKey = new Map();
    for (const variant of existingVariants) {
        const key = getVariantKey(variant.color, variant.size);
        if (!existingByKey.has(key)) {
            existingByKey.set(key, variant);
        }
    }

    const activeVariantIds = [];
    for (const variant of desiredVariants) {
        let existingVariant = null;

        if (variant.oldColor) {
            existingVariant = existingByKey.get(getVariantKey(variant.oldColor, variant.size));
        }

        if (!existingVariant) {
            existingVariant = existingByKey.get(getVariantKey(variant.color, variant.size));
        }

        if (existingVariant) {
            await connection.query(
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
                    variant.isActive ? 1 : 0,
                    existingVariant.variantId,
                    productId
                ]
            );
            activeVariantIds.push(existingVariant.variantId);
            continue;
        }

        const [result] = await connection.query(
            `
            INSERT INTO product_variants (
                product_id,
                color,
                size,
                stock,
                is_active
            )
            VALUES (?, ?, ?, 0, ?)
            `,
            [
                productId,
                variant.color,
                variant.size,
                variant.isActive ? 1 : 0
            ]
        );
        activeVariantIds.push(result.insertId);
    }

    if (activeVariantIds.length) {
        await connection.query(
            `
            UPDATE product_variants
            SET is_active = 0
            WHERE product_id = ?
              AND variant_id NOT IN (?)
            `,
            [productId, activeVariantIds]
        );
    }
}

async function getCategorySizeType(connection, categoryId) {
    const [categories] = await connection.query(
        `
        SELECT size_type AS sizeType
        FROM categories
        WHERE category_id = ?
        `,
        [categoryId]
    );

    return normalizeSizeType(categories[0]?.sizeType);
}
async function saveProductColorImages(connection, productId, colorItems) {
    await connection.query(
        `
        UPDATE product_color_images
        SET is_active = 0
        WHERE product_id = ?
        `,
        [productId]
    );

    for (const item of colorItems) {
        if (!item.imageUrl) continue;

        await connection.query(
            `
            INSERT INTO product_color_images (
                product_id,
                color,
                image_url,
                is_active
            )
            VALUES (?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE
                image_url = VALUES(image_url),
                is_active = 1
            `,
            [
                productId,
                item.name,
                item.imageUrl
            ]
        );
    }
}
function mapColorImage(row) {
    return {
        color: row.color,
        imageUrl: row.imageUrl,
        isActive: Boolean(row.isActive)
    };
}
function mapProduct(row, variants = [], colorImages = []) {
    const stock = variants.reduce((sum, item) => sum + Number(item.stock || 0), 0);

    return {
        id: formatProductId(row.productId),
        productId: row.productId,
        sku: formatProductId(row.productId),
        name: row.name,
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        categorySizeType: row.categorySizeType,
        price: Number(row.price),
        description: row.description,
        status: row.isActive ? 'active' : 'draft',
        stock,
        image: colorImages[0]?.imageUrl || '',
        colorImages,
        variants
    };
}

router.get('/', async (req, res) => {
    const [products] = await pool.query(`
        SELECT
            p.product_id AS productId,
            p.name,
            p.category_id AS categoryId,
            c.category_name AS categoryName,
            c.size_type AS categorySizeType,
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
    const [colorImageRows] = await pool.query(`
        SELECT
            product_id AS productId,
            color,
            image_url AS imageUrl,
            is_active AS isActive
        FROM product_color_images
        ORDER BY image_id
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
        const productColorImages = colorImageRows
            .filter((image) => image.productId === product.productId&& Boolean(image.isActive))
            .map(mapColorImage);
        return mapProduct(product, productVariants, productColorImages);
    });

    res.json(result);
});

router.get('/categories', async (req, res) => {
    const [categories] = await pool.query(`
        SELECT
            c.category_id AS categoryId,
            c.category_name AS name,
            c.size_type AS sizeType,
            c.is_active AS isActive,
            COUNT(p.product_id) AS productCount
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.category_id
        GROUP BY
            c.category_id,
            c.category_name,
            c.size_type,
            c.is_active
        ORDER BY c.category_id
    `);

    res.json(categories.map((category) => ({
        categoryId: category.categoryId,
        id: `CAT-${String(category.categoryId).padStart(2, '0')}`,
        name: category.name,
        sizeType: normalizeSizeType(category.sizeType),
        productCount: Number(category.productCount || 0),
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
            c.category_name AS categoryName,
            c.size_type AS categorySizeType,
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
    const [colorImageRows] = await pool.query(`
        SELECT
            product_id AS productId,
            color,
            image_url AS imageUrl,
            is_active AS isActive
        FROM product_color_images
        WHERE is_active = 1
        ORDER BY image_id
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
        const productColorImages = colorImageRows
            .filter((image) => image.productId === product.productId)
            .map(mapColorImage);
        return mapProduct(product, productVariants, productColorImages);
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
            c.category_name AS categoryName,
            c.size_type AS categorySizeType,
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
    const [colorImageRows] = await pool.query(`
        SELECT
            product_id AS productId,
            color,
            image_url AS imageUrl,
            is_active AS isActive
        FROM product_color_images
        WHERE product_id = ?
          AND is_active = 1
        ORDER BY image_id
    `, [productId]);

    const productColorImages = colorImageRows.map(mapColorImage);
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

    res.json(mapProduct(products[0], productVariants, productColorImages));
});
router.get('/:id', async (req, res) => {
    const productId = parseProductId(req.params.id);

    const [products] = await pool.query(`
        SELECT
            p.product_id AS productId,
            p.name,
            p.category_id AS categoryId,
            c.category_name AS categoryName,
            c.size_type AS categorySizeType,
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
    const [colorImageRows] = await pool.query(`
        SELECT
            product_id AS productId,
            color,
            image_url AS imageUrl,
            is_active AS isActive
        FROM product_color_images
        WHERE product_id = ?
        ORDER BY image_id
    `, [productId]);

    const productColorImages = colorImageRows.map(mapColorImage);
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

    res.json(mapProduct(products[0], productVariants, productColorImages));
});
router.post('/', async (req, res) => {
    const { name, categoryId, price, description, isActive, colors, variants } = req.body;
    const productColors = normalizeColorItems(colors, variants);

    if (!name || !categoryId || !price || !description) {
        return res.status(400).json({ message: 'Thiếu thông tin sản phâm' });
    }

    if (productColors.length === 0) {
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
        const sizeType = await getCategorySizeType(connection, categoryId);
        const sizes = getSizesBySizeType(sizeType);

        await syncProductVariants(connection, productId, productColors, sizes);
        await saveProductColorImages(connection, productId, productColors);
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
    const { name, categoryId, price, description, isActive, colors, variants } = req.body;
    const productColors = normalizeColorItems(colors, variants);

    if (!name || !categoryId || !price || !description) {
        return res.status(400).json({ message: 'Thiếu thông tin sản phẩm' });
    }

    if (productColors.length === 0) {
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

        const sizeType = await getCategorySizeType(connection, categoryId);
        const sizes = getSizesBySizeType(sizeType);

        await syncProductVariants(connection, productId, productColors, sizes);
        await saveProductColorImages(connection, productId, productColors);
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
    const { name, sizeType } = req.body;
    const normalizedSizeType = normalizeSizeType(sizeType);

    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Ten danh muc khong duoc de trong' });
    }

    try {
        const [result] = await pool.query(
            `
            INSERT INTO categories (category_name, size_type)
            VALUES (?, ?)
            `,
            [name.trim(), normalizedSizeType]
        );

        res.status(201).json({
            message: 'Tao danh muc thanh cong',
            category: {
                categoryId: result.insertId,
                name: name.trim(),
                sizeType: normalizedSizeType
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
    const { name, sizeType } = req.body;
    const normalizedSizeType = normalizeSizeType(sizeType);

    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Ten danh muc khong duoc de trong' });
    }

    try {
        const [result] = await pool.query(
            `
            UPDATE categories
            SET category_name = ?,
                size_type = ?
            WHERE category_id = ?
            `,
            [name.trim(), normalizedSizeType, categoryId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Khong tim thay danh muc' });
        }

        res.json({
            message: 'Cap nhat danh muc thanh cong',
            category: {
                categoryId,
                name: name.trim(),
                sizeType: normalizedSizeType
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
