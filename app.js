const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');



dotenv.config();


const app = express();
const port = process.env.PORT;



app.use(cookieParser());
app.use(express.json());

//endpoint try
app.get('/', (req, res) => {
    res.send('Halo kopi raisa!');
});

const newsController = require('./src/content/news.controller');
const userController = require('./src/auth/user.controller');
app.use("/api/v1/news", newsController);
app.use("/api/v1", userController);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});