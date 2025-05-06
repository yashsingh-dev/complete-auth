const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { globalLimiter } = require('./middlewares/rateLimit.middleware');
const dbConnection = require('./db/connection');
const authRoute = require('./routes/auth.route');
require('dotenv').config();
const app = express();

dbConnection();
app.use(helmet());
app.use(globalLimiter);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: [process.env.ORIGIN],
    credentials: true,
    methods: ["GET", "POST"]
}))

app.use('/auth', authRoute);


module.exports = app;