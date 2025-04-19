const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const cors = require('cors');
require('./src/auth/passport-config');
require('./src/auth/facebook-config');
// const passportLink = require('./src/auth/facebook-config');
const session = require('express-session');

dotenv.config();

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
app.use(cookieParser());
app.use(cors(corsOption));

//endpoint try
app.get('/', (req, res) => {
    res.send('Halo kopi raisa!');
});


const newsController = require('./src/content/news.controller');
const authRoutes = require('./src/auth/user.controller');
const partnerRoutes = require('./src/partners/partner.controller');

app.use("/api/v1/news", newsController);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/partner", partnerRoutes);

app.listen(port, () => {
    console.log(`Server is running on... http://localhost:${port}`);
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ message: 'Terjadi kesalahan di server.' });
});