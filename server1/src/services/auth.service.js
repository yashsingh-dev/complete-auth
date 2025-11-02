const userModel = require('../models/user.model');
const refreshTokenModel = require('../models/refreshToken.model');
const blacklistTokenModel = require('../models/blacklistToken.model');
const otpModel = require('../models/otp.model');
const logger = require('../config/logger.config');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { secureHash } = require('../utils/crypto.utils');
const { verifyHash, createHash } = require('../utils/bcrypt.utils');
const { generateAccessToken, generateRefreshToken } = require('../utils/setJwtToken.utils');
const { getOtp } = require('../utils/otp.utils');
const { MESSAGES, TOKEN_EXPIRY, OTP, FORGET_PASS } = require('../config/constants');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } = require('../lib/email');
const ApiError = require('../utils/ApiError');

const login = async (email, password, rememberMe) => {

    // Find User
    const user = await userModel.findOne({ email }).select('+password');
    if (!user) {
        throw new ApiError(401, MESSAGES.INVALID_EMAIL_PASSWORD);
    }

    // Check for google account
    if (user.isGoogleAccount) {
        throw new ApiError(400, MESSAGES.LOGIN_WITH_GOOGLE);
    }

    // Check Password
    const isMatch = await verifyHash(password, user.password);
    if (!isMatch) {
        throw new ApiError(401, MESSAGES.INVALID_EMAIL_PASSWORD);
    }

    const refreshTokenExpiry = rememberMe ? undefined : TOKEN_EXPIRY.REFRESH_TOKEN_SHORT;

    // Generate JWT Tokens
    const accessToken = await generateAccessToken(user._id, user.tokenVersion);
    const refreshToken = await generateRefreshToken(user._id, refreshTokenExpiry);

    return { user, accessToken, refreshToken };
};

const register = async (fullname, email, password) => {

    // Check User
    let user = await userModel.findOne({ email }).select('+password');
    if (user) {
        const error = new Error(MESSAGES.USER_EXISTS);
        error.statusCode = 409;
        throw error;
    }

    // Encyrpt Password
    let hash_password = await createHash(password);

    // Add User
    let new_user = await userModel.create({ fullname, email, password: hash_password });

    // Generate JWT Token
    let accessToken = await generateAccessToken(new_user._id, new_user.tokenVersion);
    let refreshToken = await generateRefreshToken(new_user._id);

    return { new_user, accessToken, refreshToken };
};

const googleLogin = async (email, name) => {

    // Check if user already exists
    let user = await userModel.findOne({ email });
    if (!user) {
        // Create new user
        user = await userModel.create({
            fullname: name,
            email,
            isGoogleAccount: true,
        });
    }

    // Generate JWT Token
    let accessToken = await generateAccessToken(user._id, user.tokenVersion);
    let refreshToken = await generateRefreshToken(user._id);

    return { accessToken, refreshToken, user };
};

const logout = async (accessToken, refreshToken) => {

    // Check if refreshToken is valid.
    const secret_key = process.env.JWT_REFRESH_KEY || 'default-key';
    const decoded = jwt.verify(refreshToken, secret_key);

    // Check if the user from the token exists
    const user = await userModel.findById(decoded._id);
    if (!user) {
        const error = new Error(MESSAGES.USER_NOT_FOUND);
        error.statusCode = 409;
        throw error;
    }

    // Create accessToken hash and it in blacklist collection
    const hashAccessToken = secureHash(accessToken);
    await blacklistTokenModel.create({ token: hashAccessToken });

    // Create refreshToken hash delete from refreshToken collection
    const hashRefreshToken = secureHash(refreshToken);
    await refreshTokenModel.findOneAndDelete({ token: hashRefreshToken });

};

const logoutAll = async (refreshToken) => {

    // Check if refreshToken is valid.
    const secret_key = process.env.JWT_REFRESH_KEY || 'default-key';
    const decoded = jwt.verify(refreshToken, secret_key);

    await Promise.all([
        // Delete all refresh tokens for the user
        refreshTokenModel.deleteMany({ userId: decoded._id }),

        // Increment the user's tokenVersion
        userModel.updateOne({ _id: decoded._id }, { $inc: { tokenVersion: 1 } })
    ]);

};

const sendVerifyEmailOtp = async (email, userId) => {

    // Generate OTP and Token
    const otp = getOtp(OTP.LENGTH.toString());
    const token = crypto.randomBytes(20).toString('hex');

    // Send Email
    await sendVerificationEmail(email, otp);

    // Create a document in Database
    await otpModel.create({
        userId,
        token,
        code: otp
    });

    return { token };
};

const verifyEmail = async (userId, token, code) => {

    // Find in Database
    const otp_model = await otpModel.findOne({ userId });

    // Check OTP
    if (!otp_model) {
        const error = new Error(MESSAGES.OTP_EXPIRE);
        error.statusCode = 410;
        throw error;
    }

    if (code !== otp_model.code) {
        const error = new Error(MESSAGES.INCORRECT_OTP);
        error.statusCode = 400;
        throw error;
    }

    // Check Token
    if (token !== otp_model.token) {
        const error = new Error(MESSAGES.LINK_EXPIRE);
        error.statusCode = 410;
        throw error;
    }

    //Delete Otp from Database
    await otpModel.findOneAndDelete({ userId });

    //Set isVerifed true in user document
    const updatedUser = await userModel.findOneAndUpdate({ _id: userId }, { isVerified: true }, { new: true });

    //Send Welcome Email
    await sendWelcomeEmail(updatedUser.email, updatedUser.fullname);

    return { updatedUser };
};

const forgetPassword = async (email) => {

    // Check User
    const user = await userModel.findOne({ email });
    if (!user) {
        const error = new Error(MESSAGES.USER_NOT_FOUND);
        error.statusCode = 404;
        throw error;
    }

    // Check for google account
    if (user.isGoogleAccount) {
        const error = new Error(MESSAGES.LOGIN_WITH_GOOGLE);
        error.statusCode = 400;
        throw error;
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiresAt = Date.now() + FORGET_PASS.EXPIRY_MS;

    // Save in user database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    // Send Email
    await sendPasswordResetEmail(email, `${process.env.CLIENT_URL_DEV}/reset/${resetToken}`);
};

const resetPassword = async (token, password) => {

    // Check token in database
    const user = await userModel.findOne({
        resetPasswordToken: token
    });
    if (!user) {
        const error = new Error(MESSAGES.INVALID_TOKEN);
        error.statusCode = 403;
        throw error;
    }

    if (user.resetPasswordExpiresAt.getTime() < Date.now()) {
        // Remove token from DB 
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        const error = new Error(MESSAGES.LINK_EXPIRE);
        error.statusCode = 410;
        throw error;
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

};

const refreshAccessToken = async (oldRefreshToken) => {

    // Create refreshToken hash and check if it exists in DB
    const hashRefreshToken = secureHash(oldRefreshToken);
    const tokenDoc = await refreshTokenModel.findOne({ token: hashRefreshToken });
    if (!tokenDoc) {
        const error = new Error(MESSAGES.INVALID_REFRESH_TOKEN);
        error.statusCode = 403;
        throw error;
    }

    // Verify refresh token and expiry using its secret key
    const secret_key = process.env.JWT_REFRESH_KEY || 'default-key';
    const decoded = jwt.verify(oldRefreshToken, secret_key);

    // Check For Remember Me
    const createAt = decoded.iat;
    const expireAt = decoded.exp;
    const expiryTime = (expireAt - createAt) / 3600; // in hours

    // Delete old refresh token hash from DB
    await refreshTokenModel.findOneAndDelete({ token: hashRefreshToken });

    // Get user from collection using decoded token id
    const user = await userModel.findById(decoded._id);

    if (!user) {
        const error = new Error(MESSAGES.USER_NOT_FOUND);
        error.statusCode = 409;
        throw error;
    }

    logger.info("Remain Expiry Time: " + expiryTime);
    let refreshTokenExpiry = (expiryTime > 1) ? undefined : TOKEN_EXPIRY.REFRESH_TOKEN_SHORT;

    // Generate new access and refresh token
    let newAccessToken = await generateAccessToken(decoded._id, user.tokenVersion);
    let newRefreshToken = await generateRefreshToken(decoded._id, refreshTokenExpiry);

    return { newAccessToken, newRefreshToken, expiryTime };

};

module.exports = {
    login,
    register,
    googleLogin,
    logout,
    logoutAll,
    sendVerifyEmailOtp,
    verifyEmail,
    forgetPassword,
    resetPassword,
    refreshAccessToken
};