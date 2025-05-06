const jwt = require('jsonwebtoken');
const userModel = require("../models/user.model");
const { MESSAGES } = require("../config/constants");
const blacklistTokenModel = require('../models/blacklistToken.model');

module.exports.ProtectedRoute = async (req, res, next) => {
    try {
        //First Check Refresh Token
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ message: MESSAGES.REFRESH_TOKEN_MISSING });
        
        //Check Acess Token
        const accessToken = req.cookies.accessToken;
        if (!accessToken) return res.status(401).json({ message: MESSAGES.ACCESS_TOKEN_MISSING });

        //Check if Blacklisted DB
        let isBlacklisted = await blacklistTokenModel.findOne({ token: accessToken });
        if (isBlacklisted) {
            //Clear Cookie from Frontend
            res.clearCookie(COOKIES.ACCESS_TOKEN, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict'
            });

            res.clearCookie(COOKIES.REFRESH_TOKEN, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict'
            });
            return res.status(401).json({ message: MESSAGES.TOKEN_REVOKE });
        }

        //Verify JWT Signature and expiry 
        let decoded = await jwt.verify(accessToken, process.env.JWT_ACCESS_KEY);
        let user_data = await userModel.findById(decoded._id);
        if (!user_data) return res.status(401).json({ error: MESSAGES.USER_NOT_FOUND });

        req.user = { ...user_data.toObject(), tokenExp: decoded.exp * 1000 };
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired, please login again" });
        }
        console.log("ProtectedRoute Error: ", error);
        return res.status(401).json({ error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}