const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const refreshTokenModel = require('../models/refreshToken.model');
const blacklistTokenModel = require('../models/blacklistToken.model');
const otpModel = require('../models/otp.model');
const { MESSAGES, COOKIES, TOKEN_EXPIRY, OTP, FORGET_PASS } = require('../config/constants');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtToken');
const { comparePassword, getHashPassword } = require('../utils/bcrypt');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } = require('../lib/email');
const { getOtp } = require('../utils/otp');

const login = async (req, res, next) => {
    try {
        let { email, password, rememberMe } = req.body;
        let user = await userModel.findOne({ email }).select('+password');
        if (!user) return res.status(401).json({ error: MESSAGES.INVALID_EMAIL_PASSWORD });

        let isMatch = await comparePassword({ textPassword: password, hashPassword: user.password });
        if (!isMatch) return res.status(401).json({ error: MESSAGES.INVALID_EMAIL_PASSWORD });

        let access_token = await generateAccessToken(user._id, user.tokenVersion);
        let refresh_token;
        if (rememberMe) {
            refresh_token = await generateRefreshToken(user._id);
            // Add a large age cookie
            res.cookie(COOKIES.REFRESH_TOKEN, refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: COOKIES.REFRESH_TOKEN_AGE_MS,
            });
        }
        else {
            refresh_token = await generateRefreshToken(user._id, TOKEN_EXPIRY.REFRESH_TOKEN_SHORT);
            // Add a short age cookie
            res.cookie(COOKIES.REFRESH_TOKEN, refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: COOKIES.REFRESH_TOKEN_SHORT_AGE_MS,
            });
        }

        res.cookie(COOKIES.ACCESS_TOKEN, access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: COOKIES.ACCESS_TOKEN_AGE_MS,
        });

        res.status(200).json({
            ...user.toObject(),
            password: undefined,
            tokenExp: Date.now() + TOKEN_EXPIRY.ACCESS_TOKEN_MS,
        });
    }
    catch (error) {
        console.log("Login Error: ", error);
        return res.status(500).json({ error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}

const signup = async (req, res, next) => {
    try {
        let { fullname, email, password } = req.body;
        let user = await userModel.findOne({ email }).select('+password');
        if (user) return res.status(409).json({ error: MESSAGES.USER_EXISTS });

        let hash_password = await getHashPassword(password);
        let new_user = await userModel.create({ fullname, email, password: hash_password });

        let access_token = await generateAccessToken(new_user._id, new_user.tokenVersion);
        let refresh_token = await generateRefreshToken(new_user._id);

        res.cookie(COOKIES.ACCESS_TOKEN, access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: COOKIES.ACCESS_TOKEN_AGE_MS
        }).cookie(COOKIES.REFRESH_TOKEN, refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: COOKIES.REFRESH_TOKEN_AGE_MS
        });

        res.status(201).json({
            ...new_user.toObject(),
            password: undefined,
            tokenExp: Date.now() + TOKEN_EXPIRY.ACCESS_TOKEN_MS,
        });
    }
    catch (error) {
        console.log("Signup Error: ", error);
        return res.status(500).json({ error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}

const checkAuth = async (req, res, next) => {
    try {
        res.status(200).json(req.user);
    }
    catch (error) {
        console.log("Signup Error: ", error);
        return res.status(500).json({ error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}

const logout = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        // Check if token exists in cookie
        if (refreshToken) {
            //Check if refreshToken is valid.
            await jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);

            //Add accessToken in blacklist
            await blacklistTokenModel.create({ token: accessToken });

            //Delete refreshToken from Database. 
            await refreshTokenModel.findOneAndDelete({ token: refreshToken });
        }

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

        res.status(200).json({ success: MESSAGES.LOGOUT_SUCCESS });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}

const sendVerifyEmailOtp = async (req, res, next) => {
    try {
        const otp = getOtp(OTP.LENGTH.toString());
        await sendVerificationEmail(req.user.email, otp);

        await otpModel.create({
            userId: req.user._id,
            code: otp,
            type: OTP.EMAIL_VERIFY
        });
        return res.status(200).json({ error: MESSAGES.OTP_SEND });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}

const verifyEmail = async (req, res, next) => {
    try {
        const { code } = req.body;
        const otp_user = await otpModel.findOne({ userId: req.user._id });
        if (!otp_user) return res.status(410).json({ error: MESSAGES.OTP_EXPIRE });
        if (code !== otp_user.code) return res.status(401).json({ error: MESSAGES.INCORRECT_OTP });

        //Delete Otp from Database
        await otpModel.findOneAndDelete({ userId: req.user._id });

        //Set isVerifed true in user document
        const updatedUser = await userModel.findOneAndUpdate({ _id: req.user._id }, { isVerified: true }, { new: true });

        //Send Welcome Email
        await sendWelcomeEmail(req.user.email, req.user.fullname);
        return res.status(200).json(updatedUser);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}

const refreshAccessToken = async (req, res, next) => {
    try {
        // Check if token exists in cookie
        const oldRefreshToken = req.cookies.refreshToken;
        if (!oldRefreshToken) {
            return res.status(401).json({ message: 'Refresh token missing' });
        }

        // Check if token exists in DB
        const tokenDoc = await refreshTokenModel.findOne({ token: oldRefreshToken });
        if (!tokenDoc) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        // Verify refresh token and expiry using its secret key
        const decoded = await jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_KEY);
        let createAt = decoded.iat;
        let expireAt = decoded.exp;
        let expiryTime = (expireAt - createAt) / 3600; // in hours
        console.log(expiryTime);

        // Delete old refresh token from DB
        await refreshTokenModel.findOneAndDelete({ token: oldRefreshToken });

        //Get tokenVersion from user by its Id
        const user = await userModel.findById(decoded._id);

        // Generate new access and refresh token
        let newAccessToken = await generateAccessToken(decoded._id, user.tokenVersion);
        let newRefreshToken;
        if (expiryTime > 1) {
            newRefreshToken = await generateRefreshToken(decoded._id);
            // Add a large age cookie
            res.cookie(COOKIES.REFRESH_TOKEN, newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: COOKIES.REFRESH_TOKEN_AGE_MS,
            });
        }
        else {
            newRefreshToken = await generateRefreshToken(decoded._id, TOKEN_EXPIRY.REFRESH_TOKEN_SHORT);
            // Add a short age cookie
            res.cookie(COOKIES.REFRESH_TOKEN, newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: COOKIES.REFRESH_TOKEN_SHORT_AGE_MS,
            });
        }

        res.cookie(COOKIES.ACCESS_TOKEN, newAccessToken, {
            httpOnly: true,
            sameSite: 'Strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: COOKIES.ACCESS_TOKEN_AGE,
        });

        res.status(200).json({
            tokenExp: Date.now() + TOKEN_EXPIRY.ACCESS_TOKEN_MS,
        });
    }
    catch (error) {
        console.error("Refresh Token Error: ", error);
        if (error.name === 'TokenExpiredError') {
            //Remove this expired token from DB
            await refreshTokenModel.findOneAndDelete({ token: oldRefreshToken });
            return res.status(401).json({ message: "Session expired. Please login again" });
        }
        return res.status(500).json({ error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}

const forgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.status(401).json({ error: "User not found" });

        //Generate a token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiresAt = FORGET_PASS.EXPIRY_MS;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;
        await user.save();

        //send email
        await sendPasswordResetEmail(email, `${process.env.ORIGIN}/reset-password/${resetToken}`);

        return res.status(200).json({ success: "Password reset link sent to your email" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        const user = await userModel.findOne({
            resetPasswordToken: token
        });
        if (!user) return res.status(401).json({ error: "Invalid token" });
        if (user.resetPasswordExpiresAt.getTime() < Date.now()) return res.status(401).json({ error: "Token Expiried" });

        //update password
        let hash_password = await getHashPassword(password);
        user.password = hash_password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        //send reset password success email
        await sendResetSuccessEmail(user.email);

        return res.status(200).json({ success: "Password reset successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
}



module.exports = { login, signup, checkAuth, logout, verifyEmail, sendVerifyEmailOtp, refreshAccessToken, forgetPassword, resetPassword };