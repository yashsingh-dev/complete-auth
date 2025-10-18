const { COOKIES } = require("../config/constants");

module.exports.setAuthTokens = async function (res, cookieName, token, maxAge) {

    res.cookie(cookieName, token, {
        httpOnly: true,
        secure: (process.env.NODE_ENV || 'development') === 'production',
        sameSite: 'Strict',
        maxAge
    });
};

module.exports.clearToken = async function (res, cookieName) {

    res.clearCookie(cookieName, {
        httpOnly: true,
        secure: (process.env.NODE_ENV || 'development') === 'production',
        sameSite: 'Strict'
    });
};

module.exports.clearTokenCookies = async function (res) {

    res.clearCookie(COOKIES.ACCESS_TOKEN, {
        httpOnly: true,
        secure: (process.env.NODE_ENV || 'development') === 'production',
        sameSite: 'Strict'
    });

    res.clearCookie(COOKIES.REFRESH_TOKEN, {
        httpOnly: true,
        secure: (process.env.NODE_ENV || 'development') === 'production',
        sameSite: 'Strict'
    });
};