const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const cors = require('cors');
require('./src/auth/passport-config');


dotenv.config();

const corsOption = {
    origin: process.env.CORS_ORIGIN,
    credentials: true, 
};
app.use(cors(corsOption));
const app = express();
const port = process.env.PORT;


app.use(passport.initialize());
app.use(cookieParser());
app.use(express.json());

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
    console.log(`Server is running on http://localhost:${port}`);
});