const express = require('express');
require('./config/envValidator');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const Limiter = require('./middlewares/rateLimit.middleware');
const dbConnection = require('./db/connection');
const authRoute = require('./routes/auth.route');
require('dotenv').config();
const app = express();

dbConnection();
app.use(cors({
    origin: [process.env.ORIGIN, 'http://localhost:5173'],
    credentials: true
}));
app.use(helmet());
app.use(Limiter.global);
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use('/api/auth', authRoute);


module.exports = app;