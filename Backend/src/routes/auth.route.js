const express = require('express');
const Schema = require('../schemas/auth.schema');
const Limiter = require('../middlewares/rateLimit.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const router = express.Router();
const Controller = require('../controllers/auth.controller');


router.post('/login',
    Limiter.login,
    Schema.login,
    Controller.login
);

router.post('/signup',
    Limiter.signup,
    Schema.signup,
    Controller.signup
);

router.post('/google',
    Controller.googleLogin
);

router.post('/google-one-tap',
    Controller.googleOneTapLogin
);

router.post('/forget-password',
    Limiter.forgetPass,
    Schema.forgetPass,
    Controller.forgetPassword
);

router.post('/reset-password',
    Schema.resetPass,
    Controller.resetPassword
);

router.get('/logout',
    authenticate,
    Controller.logout
);

router.get('/check-auth',
    authenticate,
    Controller.checkAuth
);

router.post('/verify-email',
    authenticate,
    Schema.verifyEmail,
    Controller.verifyEmail
);

router.get('/send-email-otp',
    Limiter.sendEmailOTP,
    authenticate,
    Controller.sendVerifyEmailOtp
);

router.get('/refresh-token',
    Limiter.refreshToken,
    Controller.refreshAccessToken
);


module.exports = router;