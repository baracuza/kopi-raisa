const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const cors = require('cors');
require('./src/auth/passport-config');
require('./src/auth/facebook-config');
const passportLink = require('./src/auth/facebook-config');


dotenv.config();

const app = express();
const port = process.env.PORT;
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];

const corsOption = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

app.use(express.json());

app.use(passport.initialize());
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