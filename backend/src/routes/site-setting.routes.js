const express = require('express');
const pool = require('../data/mysql');

const router = express.Router();

router.get('/ui', async (req, res) => {
    const [rows] = await pool.query(`
        SELECT setting_key AS settingKey, setting_value AS settingValue
        FROM site_settings
        WHERE setting_key IN ('bannerUrl', 'topBarText', 'topBarVisible')
    `);

    const settings = rows.reduce((result, row) => {
        result[row.settingKey] = row.settingValue;
        return result;
    }, {});

    res.json({
        bannerUrl: settings.bannerUrl || '',
        topBarText: settings.topBarText || '',
        topBarVisible: settings.topBarVisible === '1'
    });
});

router.put('/ui', async (req, res) => {
    const bannerUrl = String(req.body.bannerUrl || '').trim();
    const topBarText = String(req.body.topBarText || '').trim();
    const topBarVisible = req.body.topBarVisible ? '1' : '0';

    if (!bannerUrl || !topBarText) {
        return res.status(400).json({
            message: 'Thiếu thông tin cấu hình giao diện'
        });
    }

    const values = [
        ['bannerUrl', bannerUrl],
        ['topBarText', topBarText],
        ['topBarVisible', topBarVisible]
    ];

    for (const [key, value] of values) {
        await pool.query(
            `
            INSERT INTO site_settings (setting_key, setting_value)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
            `,
            [key, value]
        );
    }

    res.json({
        message: 'Cập nhật cấu hình giao diện thành công',
        uiConfig: {
            bannerUrl,
            topBarText,
            topBarVisible: topBarVisible === '1'
        }
    });
});

module.exports = router;