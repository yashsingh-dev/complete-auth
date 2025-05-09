const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const Limiter = require('./middlewares/rateLimit.middleware');
const dbConnection = require('./db/connection');
const authRoute = require('./routes/auth.route');
const moniterRoute = require('./routes/moniter.route');
const client = require('prom-client');
require('dotenv').config();
const app = express();

dbConnection();
app.use(helmet());
app.use(Limiter.global);
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cors({
    origin: [process.env.ORIGIN],
    credentials: true,
    methods: ["GET", "POST"]
}));
const collectDeafultMetrics = client.collectDefaultMetrics;
collectDeafultMetrics({ register: client.register });


app.use('/api/moniter', moniterRoute);
app.use('/api/auth', authRoute);


module.exports = app;