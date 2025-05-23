module.exports.setAuthCookie = async function (res, cookieName, token, maxAge) {

    res.cookie(cookieName, token, {
        httpOnly: true,
        secure: (process.env.NODE_ENV || 'development') === 'production',
        sameSite: 'Strict',
        maxAge
    });
};

module.exports.clearCookie = async function (res, cookieName) {

    res.clearCookie(cookieName, {
        httpOnly: true,
        secure: (process.env.NODE_ENV || 'development') === 'production',
        sameSite: 'Strict'
    });
};