const express = require('express');
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const Limiter = require('./middlewares/rateLimit.middleware');
const dbConnection = require('./db/connection');
const { errorHandler } = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

dbConnection();
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, }));
app.use(Limiter.global);
app.use(cors({
    origin: [process.env.CLIENT_URL_DEV, 'http://localhost:5173'],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(routes);
app.use(errorHandler);


module.exports = app;