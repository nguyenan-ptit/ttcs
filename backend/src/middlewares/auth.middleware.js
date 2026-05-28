const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
}

function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Không có quyền thực hiện thao tác này' });
        }

        next();
    };
}

module.exports = {
    requireAuth,
    requireRole
};