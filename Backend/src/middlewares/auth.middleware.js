const jwt = require('jsonwebtoken');
const userModel = require("../models/user.model");
const { MESSAGES } = require("../config/constants");
const blacklistTokenModel = require('../models/blacklistToken.model');
const { clearCookie } = require('../utils/setCookies.utils');
const logger = require('../config/logger.config');
const { secureHash } = require('../utils/crypto.utils');

module.exports.authenticate = async (req, res, next) => {
    try {
        // Check Refresh Token
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ success: false, message: MESSAGES.REFRESH_TOKEN_MISSING });

        // Check Access Token
        const accessToken = req.cookies.accessToken;
        if (!accessToken) return res.status(401).json({ success: false, message: MESSAGES.ACCESS_TOKEN_MISSING });

        // Check for access token hash in Blacklisted DB
        const hashAccessToken = secureHash(accessToken);
        let isBlacklisted = await blacklistTokenModel.findOne({ token: hashAccessToken });
        if (isBlacklisted) {

            // Clear Cookie from Browser
            clearCookie(res, COOKIES.ACCESS_TOKEN);
            clearCookie(res, COOKIES.REFRESH_TOKEN);

            return res.status(403).json({ success: false, message: MESSAGES.TOKEN_REVOKE });
        }

        // Verify JWT Signature and expiry
        const secret_key = process.env.JWT_ACCESS_KEY || 'default-key';
        let decoded = await jwt.verify(accessToken, secret_key);
        let user_data = await userModel.findById(decoded._id);
        if (!user_data) return res.status(409).json({ success: false, message: MESSAGES.USER_NOT_FOUND });

        // Check for access token version
        if (user_data.tokenVersion !== decoded.tokenVersion) {
            return res.status(403).json({ success: false, message: MESSAGES.TOKEN_REVOKE });
        }

        req.user = { ...user_data.toObject(), tokenExp: decoded.exp * 1000 };
        next();
    }
    catch (error) {
        logger.error("Authenticate Error: ", error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: MESSAGES.TOKEN_EXPIRE });
        }
        return res.status(500).json({ success: false, error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}