const express = require('express');
require('dotenv').config();
require('./config/envValidator');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const helmet = require('helmet');
const Limiter = require('./middlewares/rateLimit.middleware');
const dbConnection = require('./db/connection');
const authRoute = require('./routes/auth.route');


const app = express();
dbConnection();

app.set('trust proxy', 1);
app.use(helmet());
app.use(Limiter.global);
app.use(cors({
    origin: [process.env.ORIGIN, 'http://localhost:5173'],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(csrfProtection);
const csrfProtection = csrf({ cookie: true });

app.use('/api/auth', authRoute);


module.exports = app;