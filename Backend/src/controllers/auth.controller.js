const userModel = require('../models/user.model');
const refreshTokenModel = require('../models/refreshToken.model');
const blacklistTokenModel = require('../models/blacklistToken.model');
const otpModel = require('../models/otp.model');
const logger = require('../config/logger.config');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { secureHash } = require('../utils/crypto.utils');
const { setAuthCookie, clearCookie } = require('../utils/setCookies.utils');
const { verifyHash, createHash } = require('../utils/bcrypt.utils');
const { generateAccessToken, generateRefreshToken } = require('../utils/setJwtToken.utils');
const { getOtp } = require('../utils/otp.utils');
const { MESSAGES, COOKIES, TOKEN_EXPIRY, OTP, FORGET_PASS } = require('../config/constants');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } = require('../lib/email');
const { googleLoginHandler } = require('../lib/googleLoginHandler');
const { oauth2client } = require('../config/google.config');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');


const login = async (req, res) => {
    try {
        let { email, password, rememberMe } = req.body;

        // Find User
        let user = await userModel.findOne({ email }).select('+password');
        if (!user) return res.status(401).json({ success: false, message: MESSAGES.INVALID_EMAIL_PASSWORD });

        // Check for google account
        if (user.isGoogleAccount) {
            return res.status(400).json({
                success: false,
                message: MESSAGES.LOGIN_WITH_GOOGLE,
            });
        }

        // Check Password
        let isMatch = await verifyHash(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: MESSAGES.INVALID_EMAIL_PASSWORD });

        const refreshTokenExpiry = rememberMe ? undefined : TOKEN_EXPIRY.REFRESH_TOKEN_SHORT;
        const refreshTokenMaxAge = rememberMe ? COOKIES.REFRESH_TOKEN_AGE_MS : COOKIES.REFRESH_TOKEN_SHORT_AGE_MS;

        // Generate JWT Token
        let access_token = await generateAccessToken(user._id, user.tokenVersion);
        let refresh_token = await generateRefreshToken(user._id, refreshTokenExpiry);

        // Set Cookie
        await setAuthCookie(res, COOKIES.ACCESS_TOKEN, access_token, COOKIES.ACCESS_TOKEN_AGE_MS);
        await setAuthCookie(res, COOKIES.REFRESH_TOKEN, refresh_token, refreshTokenMaxAge);

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
        return res.status(500).json({ success: false, error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}

const signup = async (req, res) => {
    try {
        let { fullname, email, password } = req.body;

        // Check User
        let user = await userModel.findOne({ email }).select('+password');
        if (user) return res.status(409).json({ success: false, message: MESSAGES.USER_EXISTS });

        // Encyrpt Password
        let hash_password = await createHash(password);

        // Add User
        let new_user = await userModel.create({ fullname, email, password: hash_password });

        // Generate JWT Token
        let access_token = await generateAccessToken(new_user._id, new_user.tokenVersion);
        let refresh_token = await generateRefreshToken(new_user._id);

        // Set Cookie
        await setAuthCookie(res, COOKIES.ACCESS_TOKEN, access_token, COOKIES.ACCESS_TOKEN_AGE_MS);
        await setAuthCookie(res, COOKIES.REFRESH_TOKEN, refresh_token, COOKIES.REFRESH_TOKEN_AGE_MS);

        logger.info(`User Created : ${new_user.email}`);

        // Send Response
        return res.status(201).json({
            success: true,
            message: MESSAGES.SIGNUP_SUCCESS,
            payload: {
                ...new_user.toObject(),
                password: undefined,
                tokenExp: Date.now() + TOKEN_EXPIRY.ACCESS_TOKEN_MS,
            }
        });
    }
    catch (error) {
        logger.error("Signup Error: ", error);
        return res.status(500).json({ success: false, error: MESSAGES.INTERNAL_SERVER_ERROR });
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

        googleLoginHandler(res, email, name);
    }
    catch (error) {
        logger.error("Google Login Error: ", error);
        return res.status(500).json({ success: false, error: MESSAGES.INTERNAL_SERVER_ERROR });
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

        googleLoginHandler(res, email, name);
    }
    catch (error) {
        logger.error("Google One Tap Login Error: ", error);
        return res.status(500).json({ success: false, error: MESSAGES.INTERNAL_SERVER_ERROR });
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

        // Check if refreshToken is valid.
        const secret_key = process.env.JWT_REFRESH_KEY || 'default-key';
        const user = await jwt.verify(refreshToken, secret_key);
        if (!user) {
            return res.status(409).json({ success: false, message: MESSAGES.USER_NOT_FOUND })
        }

        // Create accessToken hash and it in blacklist collection
        const hashAccessToken = secureHash(accessToken);
        await blacklistTokenModel.create({ token: hashAccessToken });

        // Create refreshToken hash delete from refreshToken collection
        const hashRefreshToken = secureHash(refreshToken);
        await refreshTokenModel.findOneAndDelete({ token: hashRefreshToken });

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
        return res.status(500).json({ success: false, error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}

const sendVerifyEmailOtp = async (req, res) => {
    try {
        // Generate OTP and Token
        const otp = getOtp(OTP.LENGTH.toString());
        const token = crypto.randomBytes(20).toString('hex');

        // Send Email
        await sendVerificationEmail(req.user.email, otp);

        // Create a document in Database
        await otpModel.create({
            userId: req.user._id,
            token,
            code: otp
        });

        console.log("OTP: ", otp);

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
        return res.status(500).json({ success: false, error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}

const verifyEmail = async (req, res) => {
    try {
        const { token, code } = req.body;

        // Find in Database
        const otp_model = await otpModel.findOne({ userId: req.user._id });

        // Check OTP
        if (!otp_model) return res.status(410).json({ success: false, message: MESSAGES.OTP_EXPIRE });
        if (code !== otp_model.code) return res.status(400).json({ success: false, message: MESSAGES.INCORRECT_OTP });

        // Check Token
        if (token !== otp_model.token) return res.status(410).json({ success: false, message: MESSAGES.LINK_EXPIRE });

        //Delete Otp from Database
        await otpModel.findOneAndDelete({ userId: req.user._id });

        //Set isVerifed true in user document
        const updatedUser = await userModel.findOneAndUpdate({ _id: req.user._id }, { isVerified: true }, { new: true });

        //Send Welcome Email
        await sendWelcomeEmail(req.user.email, req.user.fullname);

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
        return res.status(500).json({ success: false, error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}

const forgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Check User
        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: MESSAGES.USER_NOT_FOUND });

        // Check for google account
        if (user.isGoogleAccount) {
            return res.status(400).json({
                success: false,
                message: MESSAGES.LOGIN_WITH_GOOGLE,
            });
        }

        // Generate a random token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiresAt = FORGET_PASS.EXPIRY_MS;

        // Save in user database
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;
        await user.save();

        // Send Email
        await sendPasswordResetEmail(email, `${process.env.ORIGIN}/reset-password/${resetToken}`);

        return res.status(200).json({ success: true, message: MESSAGES.PASS_RESET_LINK });
    }
    catch (error) {
        logger.error("Forget Password Error: ", error);
        return res.status(500).json({ success: false, error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        // Check token in database
        const user = await userModel.findOne({
            resetPasswordToken: token
        });
        if (!user) return res.status(403).json({ success: false, message: MESSAGES.INVALID_TOKEN });
        if (user.resetPasswordExpiresAt.getTime() < Date.now()) {
            // Remove token from DB 
            user.resetPasswordToken = undefined;
            user.resetPasswordExpiresAt = undefined;
            await user.save();

            return res.status(410).json({ success: false, message: MESSAGES.LINK_EXPIRE })
        };

        // New encrypted password
        let hash_password = await createHash(password);

        // Save New Password
        user.password = hash_password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        // Increment token version
        user.tokenVersion += 1;

        await user.save();

        // Send reset password success email
        await sendResetSuccessEmail(user.email);

        return res.status(200).json({ success: true, message: MESSAGES.PASSWORD_RESET });
    }
    catch (error) {
        logger.error("Reset Password: ", error);
        return res.status(500).json({ success: false, error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}

const refreshAccessToken = async (req, res) => {
    try {
        // Check if token exists in cookie
        const oldRefreshToken = req.cookies.refreshToken;
        if (!oldRefreshToken) {
            return res.status(401).json({ success: false, message: MESSAGES.REFRESH_TOKEN_MISSING });
        }

        // Create refreshToken hash and check if it exists in DB
        const hashRefreshToken = secureHash(oldRefreshToken);
        const tokenDoc = await refreshTokenModel.findOne({ token: hashRefreshToken });
        if (!tokenDoc) {
            return res.status(403).json({ success: false, message: MESSAGES.INVALID_REFRESH_TOKEN });
        }

        // Verify refresh token and expiry using its secret key
        const secret_key = process.env.JWT_REFRESH_KEY || 'default-key';
        const decoded = await jwt.verify(oldRefreshToken, secret_key);

        // Check For Remember Me
        const createAt = decoded.iat;
        const expireAt = decoded.exp;
        const expiryTime = (expireAt - createAt) / 3600; // in hours

        // Delete old refresh token hash from DB
        await refreshTokenModel.findOneAndDelete({ token: hashRefreshToken });

        // Get user from collection using decoded token id
        const user = await userModel.findById(decoded._id);

        if (!user) {
            return res.status(409).json({ success: false, message: MESSAGES.USER_NOT_FOUND });
        }

        logger.info("Remain Expiry Time: " + expiryTime);
        let refreshTokenExpiry = (expiryTime > 1) ? undefined : TOKEN_EXPIRY.REFRESH_TOKEN_SHORT;
        let refreshTokenMaxAge = (expiryTime > 1) ? COOKIES.REFRESH_TOKEN_AGE_MS : COOKIES.REFRESH_TOKEN_SHORT_AGE_MS;

        // Generate new access and refresh token
        let newAccessToken = await generateAccessToken(decoded._id, user.tokenVersion);
        let newRefreshToken = await generateRefreshToken(decoded._id, refreshTokenExpiry);

        // Set Cookie  
        await setAuthCookie(res, COOKIES.ACCESS_TOKEN, newAccessToken, COOKIES.ACCESS_TOKEN_AGE_MS);
        await setAuthCookie(res, COOKIES.REFRESH_TOKEN, newRefreshToken, refreshTokenMaxAge);

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
        if (error.name === 'TokenExpiredError') {
            //Remove this expired token hash from DB
            const hashRefreshToken = secureHash(oldRefreshToken);
            await refreshTokenModel.findOneAndDelete({ token: hashRefreshToken });
            return res.status(401).json({ success: false, error: MESSAGES.SESSION_EXPIRE });
        }
        return res.status(500).json({ success: false, error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}


module.exports = { login, signup, checkAuth, logout, verifyEmail, sendVerifyEmailOtp, refreshAccessToken, forgetPassword, resetPassword, googleLogin, googleOneTapLogin };