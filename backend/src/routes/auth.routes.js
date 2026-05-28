const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../data/mysql');

const router = express.Router();

function createToken(user) {
    return jwt.sign(
        {
            userId: user.user_id,
            username: user.username,
            role: user.role_name
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        }
    );
}

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const [users] = await pool.query(
        `
        SELECT
            u.user_id,
            u.username,
            u.password,
            u.full_name,
            u.is_active,
            r.role_name
        FROM users u
        JOIN roles r ON r.role_id = u.role_id
        WHERE u.username = ?
        `,
        [username]
    );

    if (users.length === 0) {
        return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }

    const user = users[0];

    if (!user.is_active) {
        return res.status(403).json({ message: 'Tài khoản đã bị khoá' });
    }

    if (password !== user.password) {
        return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }

    const token = createToken(user);

    res.json({
        token,
        user: {
            userId: user.user_id,
            username: user.username,
            name: user.full_name,
            role: user.role_name
        }
    });
});

router.post('/register', async (req, res) => {
    const { username, password, fullName } = req.body;

    if (!username || !password || !fullName) {
        return res.status(400).json({ message: 'Thiếu thông tin' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const [existingUsers] = await pool.query(
        'SELECT user_id FROM users WHERE username = ?',
        [username]
    );

    if (existingUsers.length > 0) {
        return res.status(409).json({ message: 'Tài khoản đã tồn tại' });
    }

    const [roles] = await pool.query(
        'SELECT role_id FROM roles WHERE role_name = ?',
        ['CUSTOMER']
    );

    if (roles.length === 0) {
        return res.status(500).json({ message: 'Chưa có role CUSTOMER trong database' });
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
        VALUES (?, ?, ?, ?, 1)
        `,
        [
            username,
            password,
            fullName,
            roles[0].role_id
        ]
    );

    res.status(201).json({
        message: 'Đăng ký thành công',
        user: {
            userId: result.insertId,
            username,
            name: fullName,
            role: 'CUSTOMER'
        }
    });
});

module.exports = router;
