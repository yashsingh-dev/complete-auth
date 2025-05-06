const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many requests. Please slow down.'
});

const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 50, //TODO
    message: 'Too many login attempts. Try again later.'
});

const signupLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 50, //TODO
    message: 'Too many signups. Try again later.'
});

const refreshTokenLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 7,
    message: 'Too many refresh attempts. Slow down.'
});

const sendEmailOTPLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: 'Too many attempts. Slow down.'
});

const verifyEmailLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: 'Too many attempts. Slow down.'
});

const forgetPassLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: 'Too many attempts. Slow down.'
});

const resetPassLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: 'Too many attempts. Slow down.'
});

module.exports = {
    loginLimiter,
    signupLimiter,
    globalLimiter,
    refreshTokenLimiter,
    sendEmailOTPLimiter,
    verifyEmailLimiter,
    forgetPassLimiter,
    resetPassLimiter
};
