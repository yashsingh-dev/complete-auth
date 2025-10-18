const refreshTokenModel = require('../models/refreshToken.model');
const logger = require('../config/logger.config');
const { secureHash } = require('../utils/crypto.utils');
const { setAuthCookie, clearCookie } = require('../utils/setCookies.utils');
const Service = require('../services/auth.service');
const { MESSAGES, COOKIES, TOKEN_EXPIRY, OTP, FORGET_PASS } = require('../config/constants');
const { oauth2client } = require('../config/google.config');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');


const login = async (req, res) => {
    try {
        let { email, password, rememberMe } = req.body;

        const result = await Service.login(email, password, rememberMe);
        const { user, accessToken, refreshToken } = result;

        const refreshTokenCookieAge = rememberMe ? COOKIES.REFRESH_TOKEN_AGE_MS : COOKIES.REFRESH_TOKEN_SHORT_AGE_MS;

        // Set Cookie
        await setAuthCookie(res, COOKIES.ACCESS_TOKEN, accessToken, COOKIES.ACCESS_TOKEN_AGE_MS);
        await setAuthCookie(res, COOKIES.REFRESH_TOKEN, refreshToken, refreshTokenCookieAge);

        logger.info(`User logged in: ${user.email}`);

        // Send Response
        return res.status(200).json({
            success: true,
            message: MESSAGES.LOGIN_SUCCESS,
            payload: {
                ...user.toObject(),
                password: undefined,
                tokenExp: Date.now() + TOKEN_EXPIRY.ACCESS_TOKEN_MS,
            }
        });
    }
    catch (error) {
        logger.error("Login Error: ", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
}

const register = async (req, res) => {
    try {
        let { fullname, email, password } = req.body;

        const result = await Service.register(fullname, email, password);
        const { newUser, accessToken, refreshToken } = result;

        // Set Cookie
        await setAuthCookie(res, COOKIES.ACCESS_TOKEN, accessToken, COOKIES.ACCESS_TOKEN_AGE_MS);
        await setAuthCookie(res, COOKIES.REFRESH_TOKEN, refreshToken, COOKIES.REFRESH_TOKEN_AGE_MS);

        logger.info(`User Created : ${new_user.email}`);

        // Send Response
        return res.status(201).json({
            success: true,
            message: MESSAGES.REGISTER_SUCCESS,
            payload: {
                ...newUser.toObject(),
                password: undefined,
                tokenExp: Date.now() + TOKEN_EXPIRY.ACCESS_TOKEN_MS,
            }
        });
    }
    catch (error) {
        logger.error("Register Error: ", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
}

const googleLogin = async (req, res) => {
    try {
        let { code } = req.body;

        // Exchange code for tokens
        const { tokens } = await oauth2client.getToken(code);
        oauth2client.setCredentials(tokens);

        // Get user info
        const oauth2 = google.oauth2({ version: "v2", auth: oauth2client });
        const { data: googleUser } = await oauth2.userinfo.get();
        const { email, name } = googleUser;

        const { accessToken, refreshToken, user } = Service.googleLogin(email, name);

        // Set Cookie
        await setAuthCookie(res, COOKIES.ACCESS_TOKEN, accessToken, COOKIES.ACCESS_TOKEN_AGE_MS);
        await setAuthCookie(res, COOKIES.REFRESH_TOKEN, refreshToken, COOKIES.REFRESH_TOKEN_AGE_MS);

        logger.info(`Google logged in : ${user.email}`);

        return res.status(200).json({
            success: true,
            message: MESSAGES.GOOGLE_LOGIN,
            payload: {
                ...user.toObject(),
                tokenExp: Date.now() + TOKEN_EXPIRY.ACCESS_TOKEN_MS,
            }
        });
    }
    catch (error) {
        logger.error("Google Login Error: ", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
}

const googleOneTapLogin = async (req, res) => {
    try {
        let { token } = req.body;

        const oauth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await oauth2Client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name } = payload;

        const { accessToken, refreshToken, user } = Service.googleLogin(email, name);

        // Set Cookie
        await setAuthCookie(res, COOKIES.ACCESS_TOKEN, accessToken, COOKIES.ACCESS_TOKEN_AGE_MS);
        await setAuthCookie(res, COOKIES.REFRESH_TOKEN, refreshToken, COOKIES.REFRESH_TOKEN_AGE_MS);

        logger.info(`Google logged in : ${user.email}`);

        return res.status(200).json({
            success: true,
            message: MESSAGES.GOOGLE_LOGIN,
            payload: {
                ...user.toObject(),
                tokenExp: Date.now() + TOKEN_EXPIRY.ACCESS_TOKEN_MS,
            }
        });
    }
    catch (error) {
        logger.error("Google One Tap Login Error: ", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
}

const checkAuth = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: MESSAGES.UNAUTH });
        }

        return res.status(200).json({
            success: true,
            message: MESSAGES.AUTH,
            payload: {
                ...req.user,
            }
        });
    }
    catch (error) {
        logger.error("CheckAuth Error: ", error);
        return res.status(500).json({ success: false, error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}

const logout = async (req, res) => {
    try {
        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        await Service.logout(accessToken, refreshToken);

        // Clear Cookie
        clearCookie(res, COOKIES.ACCESS_TOKEN);
        clearCookie(res, COOKIES.REFRESH_TOKEN);

        logger.info(`User logged out`);

        return res.status(200).json({
            success: true,
            message: MESSAGES.LOGOUT_SUCCESS
        });
    }
    catch (error) {
        logger.error("Logout Error: ", error);

        // Always clear cookies on any logout error to prevent a bad state
        clearCookie(res, COOKIES.ACCESS_TOKEN);
        clearCookie(res, COOKIES.REFRESH_TOKEN);
        return res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
}

const sendVerifyEmailOtp = async (req, res) => {
    try {
        const { token } = await Service.sendVerifyEmailOtp(req.user.email, req.user._id);

        return res.status(200).json({
            success: true,
            message: MESSAGES.OTP_SEND,
            payload: {
                token
            }
        });
    }
    catch (error) {
        logger.error("Send Verify Email Otp Error: ", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
}

const verifyEmail = async (req, res) => {
    try {
        const { token, code } = req.body;

        const { updatedUser } = await Service.verifyEmail(req.user._id, token, code);

        return res.status(200).json({
            success: true,
            message: MESSAGES.OTP_VERIFIED,
            payload: {
                ...updatedUser.toObject()
            }
        });
    }
    catch (error) {
        logger.error("Verify Email Error: ", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
}

const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        await Service.forgetPassword(email);

        return res.status(200).json({ success: true, message: MESSAGES.PASS_RESET_LINK });
    }
    catch (error) {
        logger.error("Forget Password Error: ", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        await Service.resetPassword(token, password);

        return res.status(200).json({ success: true, message: MESSAGES.PASSWORD_RESET });
    }
    catch (error) {
        logger.error("Reset Password: ", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
}

const refreshAccessToken = async (req, res) => {
    try {

        // Check if token exists in cookie
        const oldRefreshToken = req.cookies.refreshToken;

        const { newAccessToken, newRefreshToken, expiryTime } = await Service.refreshAccessToken(oldRefreshToken);

        let refreshTokenCookieAge = (expiryTime > 1) ? COOKIES.REFRESH_TOKEN_AGE_MS : COOKIES.REFRESH_TOKEN_SHORT_AGE_MS;

        // Set Cookie
        await setAuthCookie(res, COOKIES.ACCESS_TOKEN, newAccessToken, COOKIES.ACCESS_TOKEN_AGE_MS);
        await setAuthCookie(res, COOKIES.REFRESH_TOKEN, newRefreshToken, refreshTokenCookieAge);

        return res.status(200).json({
            success: true,
            message: MESSAGES.TOKEN_REFRESH,
            payload: {
                tokenExp: Date.now() + TOKEN_EXPIRY.ACCESS_TOKEN_MS,
            }
        });
    }
    catch (error) {
        logger.error("Refresh Token Error: ", error);

        //Remove this expired token hash from DB
        const hashRefreshToken = secureHash(oldRefreshToken);
        await refreshTokenModel.findOneAndDelete({ token: hashRefreshToken });

        // Clear Cookie
        clearCookie(res, COOKIES.ACCESS_TOKEN);
        clearCookie(res, COOKIES.REFRESH_TOKEN);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: MESSAGES.SESSION_EXPIRE });
        }
        return res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
}


module.exports = { login, register, checkAuth, logout, verifyEmail, sendVerifyEmailOtp, refreshAccessToken, forgetPassword, resetPassword, googleLogin, googleOneTapLogin };