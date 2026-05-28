require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const reportRoutes = require('./routes/report.routes');
const promotionRoutes = require('./routes/promotion.routes');
const storeRoutes = require('./routes/store.routes');
const siteSettingRoutes = require('./routes/site-setting.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const returnRoutes = require('./routes/return.routes');
const reviewRoutes = require('./routes/review.routes');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/store-info', storeRoutes);
app.use('/api/site-settings', siteSettingRoutes);
app.get('/', (red, res) => {
    res.json({ message: 'Backend API is running' })
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Backend API is running on http://localhost:${PORT}`);
});
