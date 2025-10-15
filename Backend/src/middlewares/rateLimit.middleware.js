const rateLimit = require('express-rate-limit');
const { MESSAGES, RATE_LIMITTER } = require('../config/constants');

const global = rateLimit({
    windowMs: RATE_LIMITTER.GLOBAL_WINDOW_MS,
    max: RATE_LIMITTER.GLOBAL_MAX,
    message: MESSAGES.TOO_MANY_REQUEST
});

const login = rateLimit({
    windowMs: RATE_LIMITTER.LOGIN_WINDOW_MS,
    max: RATE_LIMITTER.LOGIN_MAX,
    message: MESSAGES.TOO_MANY_LOGIN_REQUEST
});

const signup = rateLimit({
    windowMs: RATE_LIMITTER.SIGNUP_WINDOW_MS,
    max: RATE_LIMITTER.SIGNUP_MAX,
    message: MESSAGES.TOO_MANY_SIGNUP_REQUEST
});

const refreshToken = rateLimit({
    windowMs: RATE_LIMITTER.REFRESH_TOKEN_WINDOW_MS,
    max: RATE_LIMITTER.REFRESH_TOKEN_MAX,
    message: MESSAGES.TOO_MANY_REQUEST
});

const sendEmailOTP = rateLimit({
    windowMs: RATE_LIMITTER.SEND_EMAIL_OTP_WINDOW_MS,
    max: RATE_LIMITTER.SEND_EMAIL_OTP_MAX,
    message: MESSAGES.TOO_MANY_REQUEST
});

const forgetPass = rateLimit({
    windowMs: RATE_LIMITTER.FORGET_PASS_WINDOW_MS,
    max: RATE_LIMITTER.FORGET_PASS_MAX,
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
