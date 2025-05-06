const jwt = require('jsonwebtoken');
const { TOKEN_EXPIRY } = require('../config/constants');
const refreshTokenModel = require('../models/refreshToken.model');

module.exports.generateAccessToken = async function (userId, tokenVersion) {
    let access_token = await jwt.sign({ _id: userId, tokenVersion }, process.env.JWT_ACCESS_KEY, {
        expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN
    });

    return access_token;
}

module.exports.generateRefreshToken = async function (userId, expiry = TOKEN_EXPIRY.REFRESH_TOKEN) {
    let refresh_token = await jwt.sign({ _id: userId }, process.env.JWT_REFRESH_KEY, {
        expiresIn: expiry
    });

    await refreshTokenModel.create({ token: refresh_token, userId });
    return refresh_token;
}