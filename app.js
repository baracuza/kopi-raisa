const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
// const passportLink = require('./src/auth/facebook-config');
const session = require('express-session');

dotenv.config();

require('./src/auth/passport-config');
require('./src/auth/facebook-config');

const { createMidtransSnapToken } = require('./src/utils/midtrans');

const app = express();
const port = process.env.PORT;

const corsOption = {
    origin: [
        process.env.CORS_ORIGIN, // https://sekolahkopiraisa.vercel.app
        'http://localhost:3000'  // support development lokal
    ],
    credentials: true
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'kopi-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // true kalau HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 hari
    }
}));



app.use(passport.initialize());
app.use(passport.session()); // tambahkan ini!
app.use(cors(corsOption));


// Logging
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
});

// ===== ROUTES =====
const newsController = require('./src/content/news.controller');
const authRoutes = require('./src/auth/user.controller');
const partnerRoutes = require('./src/partners/partner.controller');
const productRoutes = require('./src/product/product.controller');
const cartRoutes = require('./src/cart/cart.controller');
const orderRoutes = require('./src/order/order.controller');

//endpoint try
app.get('/', (req, res) => {
    res.send('Halo kopi raisa!');
});

app.use("/api/v1/news", newsController);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/partner", partnerRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/order", orderRoutes);

// Swagger setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Sekolah Kopi Raisa',
            version: '1.0.0',
            description: 'API untuk aplikasi Sekolah Kopi Raisa'
        },
        components: {
            securitySchemes: {
              cookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'token'
              }
            }
          },
        servers: [
            {
                url: 'https://sekolah-kopi-raisa.up.railway.app',
                description: 'Production Server'
            },
            {
                url: 'http://localhost:3000',
                description: 'Local Environment'
            }
        ]
    },
    apis: [
        './src/**/**/*.controller.js'
    ],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ message: 'Terjadi kesalahan di server.' });
});

app.listen(port, () => {
    console.log(`Server is running on... http://localhost:${port}`);
});