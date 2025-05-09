const rateLimit = require('express-rate-limit');
const { MESSAGES } = require('../config/constants');

const global = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 150,
    message: MESSAGES.TOO_MANY_REQUEST
});

const login = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: MESSAGES.TOO_MANY_LOGIN_REQUEST
});

const signup = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: MESSAGES.TOO_MANY_SIGNUP_REQUEST
});

const refreshToken = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: MESSAGES.TOO_MANY_REQUEST
});

const sendEmailOTP = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: MESSAGES.TOO_MANY_REQUEST
});

const forgetPass = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: MESSAGES.TOO_MANY_REQUEST
});

module.exports = {
    login,
    signup,
    global,
    refreshToken,
    sendEmailOTP,
    forgetPass
};
