const { COOKIES } = require("../config/constants");
const logger = require('../config/logger.config');

const commonCookieOptions = {
    httpOnly: true,
    secure: (process.env.NODE_ENV || 'development') === 'production',
    sameSite: 'None',
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined
};

module.exports.setAuthTokens = async function (res, cookieName, token, maxAge) {

    logger.info(`Setting cookie ${cookieName} with options:`, { ...commonCookieOptions, maxAge: maxAge });
    res.cookie(cookieName, token, {
        ...commonCookieOptions,
        maxAge: maxAge
    });
};

module.exports.clearToken = async function (res, cookieName) {
    res.clearCookie(cookieName, commonCookieOptions);
};

module.exports.clearTokenCookies = async function (res) {
    res.clearCookie(COOKIES.ACCESS_TOKEN, commonCookieOptions);
    res.clearCookie(COOKIES.REFRESH_TOKEN, commonCookieOptions);
};