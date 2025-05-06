const express = require('express');
const { loginSchema, signUpSchema, verifyEmailSchema, forgetPassSchema, resetPassSchema } = require('../schemas/auth.schema');
const { loginLimiter, signupLimiter, refreshTokenLimiter, sendEmailOTPLimiter, verifyEmailLimiter, forgetPassLimiter, resetPassLimiter } = require('../middlewares/rateLimit.middleware');
const { ProtectedRoute } = require('../middlewares/auth.middleware');
const router = express.Router();
const { login, signup, checkAuth, logout, verifyEmail, sendVerifyEmailOtp, refreshAccessToken, forgetPassword, resetPassword } = require('../controllers/auth.controller');


router.post('/login', loginLimiter, loginSchema, login);
router.post('/signup', signupLimiter, signUpSchema, signup);
router.get('/logout', ProtectedRoute, logout);
router.get('/check-auth', ProtectedRoute, checkAuth);
router.post('/verify-email', verifyEmailLimiter, ProtectedRoute, verifyEmailSchema, verifyEmail);
router.get('/send-email-otp', sendEmailOTPLimiter, ProtectedRoute, sendVerifyEmailOtp);
router.post('/forget-password', forgetPassLimiter, forgetPassSchema, forgetPassword);
router.post('/reset-password', resetPassLimiter, resetPassSchema, resetPassword);
router.get('/refresh-token', refreshTokenLimiter, refreshAccessToken);


module.exports = router;