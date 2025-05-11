const { COOKIES, MESSAGES, TOKEN_EXPIRY } = require("../config/constants");
const logger = require("../config/logger.config");
const userModel = require("../models/user.model");
const { setAuthCookie } = require("../utils/setCookies.utils");
const { generateAccessToken, generateRefreshToken } = require("../utils/setJwtToken.utils");

module.exports.googleLoginHandler = async (res, email, name) => {

    try {
        // Check if user already exists
        let user = await userModel.findOne({ email });``
        if (!user) {
            // Create new user
            user = await userModel.create({
                fullname: name,
                email,
                isGoogleAccount: true,
            });
        }

        // Generate JWT Token
        let access_token = await generateAccessToken(user._id, user.tokenVersion);
        let refresh_token = await generateRefreshToken(user._id);

        // Set Cookie
        await setAuthCookie(res, COOKIES.ACCESS_TOKEN, access_token, COOKIES.ACCESS_TOKEN_AGE_MS);
        await setAuthCookie(res, COOKIES.REFRESH_TOKEN, refresh_token, COOKIES.REFRESH_TOKEN_AGE_MS);

        logger.info(`Google logged in : ${user.email}`);

        return res.status(200).json({
            success: true,
            message: MESSAGES.GOOGLE_LOGIN,
            payload: {
                ...user.toObject(),
                tokenExp: Date.now() + TOKEN_EXPIRY.ACCESS_TOKEN_MS,
            }
        });
    } catch (error) {
        throw error;
    }
}