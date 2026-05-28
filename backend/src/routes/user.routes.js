const express = require('express');
const pool = require('../data/mysql');

const router = express.Router();
router.get('/', async (req, res) => {
     const type = req.query.type;
     let whereClause = '';

     if (type === 'staff') {
        whereClause = `WHERE r.role_name <> 'CUSTOMER'`;
    } else if (type === 'customer') {
        whereClause = `WHERE r.role_name = 'CUSTOMER'`;
    }
    try {
        const type = req.query.type;
        const [users] = await pool.query(`
            SELECT
                u.user_id AS userId,
                u.username,
                u.full_name AS fullName,
                r.role_name AS role,
                u.is_active AS isActive
            FROM users u
            JOIN roles r ON r.role_id = u.role_id
            ${whereClause}
            ORDER BY u.user_id DESC
        `);

        res.json(users.map((user) => ({
            userId: user.userId,
            id: `USR-${String(user.userId).padStart(3, '0')}`,
            username: user.username,
            fullName: user.fullName,
            name: user.fullName,
            role: user.role,
            isActive: Boolean(user.isActive),
            status: user.isActive ? 'active' : 'locked'
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Không thể lấy danh sách user' });
    }
});
router.post('/', async (req, res) => {
    const { username, password, fullName, role, isActive } = req.body;

    if (!username || !password || !fullName || !role) {
        return res.status(400).json({ message: 'Thiếu thông tin tạo user' });
    }

    if (String(password).length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    try {
        const [roles] = await pool.query(
            `
            SELECT role_id AS roleId
            FROM roles
            WHERE role_name = ?
            `,
            [role]
        );

        if (roles.length === 0) {
            return res.status(400).json({ message: 'Role không hợp lệ' });
        }

        const [result] = await pool.query(
            `
            INSERT INTO users (
                username,
                password,
                full_name,
                role_id,
                is_active
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                username.trim(),
                password,
                fullName.trim(),
                roles[0].roleId,
                isActive === false ? 0 : 1
            ]
        );

        res.status(201).json({
            message: 'Tạo user thành công',
            user: {
                userId: result.insertId,
                id: `USR-${String(result.insertId).padStart(3, '0')}`,
                username: username.trim(),
                fullName: fullName.trim(),
                name: fullName.trim(),
                role,
                isActive: isActive === false ? false : true,
                status: isActive === false ? 'locked' : 'active'
            }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Username đã tồn tại' });
        }

        console.error(error);
        res.status(500).json({ message: 'Không thể tạo user' });
    }
});
router.put('/:id', async (req, res) => {
    const userId = Number(req.params.id);
    const { password, fullName, role, isActive } = req.body;

    if (!fullName || !role) {
        return res.status(400).json({ message: 'Thiếu thông tin cập nhật user' });
    }

    if (password && String(password).length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    try {
        const [roles] = await pool.query(
            `
            SELECT role_id AS roleId
            FROM roles
            WHERE role_name = ?
            `,
            [role]
        );

        if (roles.length === 0) {
            return res.status(400).json({ message: 'Role không hợp lệ' });
        }

        if (password) {
            const [result] = await pool.query(
                `
                UPDATE users
                SET
                    password = ?,
                    full_name = ?,
                    role_id = ?,
                    is_active = ?
                WHERE user_id = ?
                `,
                [
                    password,
                    fullName.trim(),
                    roles[0].roleId,
                    isActive === false ? 0 : 1,
                    userId
                ]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Không tìm thấy user' });
            }
        } else {
            const [result] = await pool.query(
                `
                UPDATE users
                SET
                    full_name = ?,
                    role_id = ?,
                    is_active = ?
                WHERE user_id = ?
                `,
                [
                    fullName.trim(),
                    roles[0].roleId,
                    isActive === false ? 0 : 1,
                    userId
                ]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Không tìm thấy user' });
            }
        }

        res.json({
            message: 'Cập nhật user thành công',
            user: {
                userId,
                id: `USR-${String(userId).padStart(3, '0')}`,
                fullName: fullName.trim(),
                name: fullName.trim(),
                role,
                isActive: isActive === false ? false : true,
                status: isActive === false ? 'locked' : 'active'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Không thể cập nhật user' });
    }
});
router.patch('/:id/status', async (req, res) => {
    const userId = Number(req.params.id);
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive phải là boolean' });
    }

    const [result] = await pool.query(
        `
        UPDATE users
        SET is_active = ?
        WHERE user_id = ?
        `,
        [isActive ? 1 : 0, userId]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    res.json({
        message: 'Câp nhật trạng thái user thành công',
        userId,
        isActive,
        status: isActive ? 'active' : 'locked'
    });
});
router.get('/:id/profile', async (req, res) => {
    const userId = req.params.id;

    const [users] = await pool.query(
        `
        SELECT
            user_id AS userId,
            username,
            full_name AS fullName
        FROM users
        WHERE user_id = ?
        `,
        [userId]
    );

    if (users.length === 0) {
        return res.status(404).json({ message: 'Khong tim thay user' });
    }

    const [addresses] = await pool.query(
        `
        SELECT
            address_id AS addressId,
            receiver_name AS receiverName,
            receiver_phone AS receiverPhone,
            address_detail AS addressDetail,
            is_default AS isDefault
        FROM addresses
        WHERE user_id = ?
        ORDER BY is_default DESC, address_id DESC
        `,
        [userId]
    );

    res.json({
        ...users[0],
        address: addresses[0] || null
    });
});

router.put('/:id/profile', async (req, res) => {
    const userId = req.params.id;
    const { fullName, phone, address } = req.body;

    if (!fullName || !phone || !address) {
        return res.status(400).json({ message: 'Thiếu thông tin profile' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [userResult] = await connection.query(
            `
            UPDATE users
            SET full_name = ?
            WHERE user_id = ?
            `,
            [fullName, userId]
        );

        if (userResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Khong tim thay user' });
        }

        const [defaultAddresses] = await connection.query(
            `
            SELECT address_id
            FROM addresses
            WHERE user_id = ? AND is_default = 1
            LIMIT 1
            `,
            [userId]
        );

        if (defaultAddresses.length > 0) {
            await connection.query(
                `
                UPDATE addresses
                SET
                    receiver_name = ?,
                    receiver_phone = ?,
                    address_detail = ?
                WHERE address_id = ?
                `,
                [fullName, phone, address, defaultAddresses[0].address_id]
            );
        } else {
            await connection.query(
                `
                INSERT INTO addresses (
                    user_id,
                    receiver_name,
                    receiver_phone,
                    address_detail,
                    is_default
                )
                VALUES (?, ?, ?, ?, 1)
                `,
                [userId, fullName, phone, address]
            );
        }

        await connection.commit();

        res.json({
            message: 'Cap nhat profile thanh cong',
            user: {
                userId: Number(userId),
                fullName,
                phone,
                address
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Khong the cap nhat profile' });
    } finally {
        connection.release();
    }
});

module.exports = router;