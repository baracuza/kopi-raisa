const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const cors = require('cors');
const session = require('express-session');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
// const passportLink = require('./src/auth/facebook-config');

dotenv.config();

// Inisialisasi konfigurasi Passport
require('./src/auth/passport-config');
require('./src/auth/facebook-config');

const { createMidtransSnapToken } = require('./src/utils/midtrans');

const app = express();
const port = process.env.PORT || 2000;

// === CORS Config ===
const allowedOrigins = [
    'https://sekolahkopiraisa.vercel.app',
    'http://localhost:3000'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

// === Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// === Session Middleware ===
app.use(session({
    secret: process.env.SESSION_SECRET || 'kopi-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',  // true untuk Vercel
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 hari
    }
}));

// === Passport ===
app.use(passport.initialize());
app.use(passport.session());

// === Logging ===
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
});

// === Routes ===
const newsController = require('./src/content/news.controller');
const authRoutes = require('./src/auth/user.controller');
const partnerRoutes = require('./src/partners/partner.controller');
const productRoutes = require('./src/product/product.controller');
const cartRoutes = require('./src/cart/cart.controller');
const orderRoutes = require('./src/order/order.controller');
const companyRoutes = require('./src/company/company.controller');

// Default Endpoint
app.get('/', (req, res) => {
    res.send('Halo kopi raisa!');
});

// Main API Routes
app.use("/api/v1/news", newsController);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/partner", partnerRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/company", companyRoutes);


// === Error Handler ===
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ message: 'Terjadi kesalahan di server.' });
});

// === Start Server (Lokal Only) ===
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on... http://localhost:${port}`);
    });
}

module.exports = app; // Penting untuk deployment ke Vercel
