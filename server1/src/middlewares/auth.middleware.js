const jwt = require('jsonwebtoken');
const userModel = require("../models/user.model");
const { MESSAGES } = require("../config/constants");
const blacklistTokenModel = require('../models/blacklistToken.model');
const { clearTokenCookies } = require('../utils/setCookies.utils');
const logger = require('../config/logger.config');
const { secureHash } = require('../utils/crypto.utils');

module.exports.authenticate = async (req, res, next) => {
    try {
        
        // Check Access Token
        const accessToken = req.cookies.accessToken;
        if (!accessToken || accessToken === 'undefined'){
            return res.status(401).json({ success: false, message: MESSAGES.ACCESS_TOKEN_MISSING });
        }

        // Check for access token hash in Blacklisted DB
        const hashAccessToken = secureHash(accessToken);
        let isBlacklisted = await blacklistTokenModel.findOne({ token: hashAccessToken });
        if (isBlacklisted) {
            clearTokenCookies(res);
            return res.status(403).json({ success: false, message: MESSAGES.TOKEN_REVOKE });
        }

        // Verify JWT Signature and expiry
        const secret_key = process.env.JWT_ACCESS_KEY || 'default-key';
        let decoded = jwt.verify(accessToken, secret_key);

        let user_data = await userModel.findById(decoded._id);
        if (!user_data){
            clearTokenCookies(res);
            return res.status(409).json({ success: false, message: MESSAGES.USER_NOT_FOUND });
        }
        // Check for access token version
        if (user_data.tokenVersion !== decoded.tokenVersion) {
            clearTokenCookies(res);
            return res.status(403).json({ success: false, message: MESSAGES.TOKEN_REVOKE });
        }

        req.user = { ...user_data.toObject(), tokenExp: decoded.exp * 1000 };
        next();
    }
    catch (error) {
        logger.error("Authenticate Error: ", error);

        // Clear cookies on any authentication error
        clearTokenCookies(res);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: MESSAGES.TOKEN_EXPIRE });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, error: MESSAGES.INVALID_TOKEN });
            
        }
        return res.status(500).json({ success: false, error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}