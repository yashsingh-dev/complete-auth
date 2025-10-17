const express = require('express');
const Schema = require('../../schemas/auth.schema');
const Limiter = require('../../middlewares/rateLimit.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const router = express.Router();
const Controller = require('../../controllers/auth.controller');
const { API } = require('../../config/constants');


router.post(API.AUTH.LOGIN,
    Limiter.login,
    Schema.login,
    Controller.login
);

router.post(API.AUTH.REGISTER,
    Limiter.register,
    Schema.register,
    Controller.register
);

router.post(API.AUTH.GOOGLE,
    Controller.googleLogin
);

router.post(API.AUTH.GOOGLE_ONETAP,
    Controller.googleOneTapLogin
);

router.post(API.AUTH.PASSWORD_FORGOT,
    Limiter.forgetPass,
    Schema.forgetPass,
    Controller.forgetPassword
);

router.post(API.AUTH.PASSWORD_RESET,
    Schema.resetPass,
    Controller.resetPassword
);

router.get(API.AUTH.LOGOUT,
    authenticate,
    Controller.logout
);

router.get(API.AUTH.STATUS,
    authenticate,
    Controller.checkAuth
);

router.post(API.AUTH.EMAIL_VERIFY,
    authenticate,
    Schema.verifyEmail,
    Controller.verifyEmail
);

router.get(API.AUTH.EMAIL_VERIFY,
    Limiter.sendEmailOTP,
    authenticate,
    Controller.sendVerifyEmailOtp
);

router.get(API.AUTH.TOKEN_REFRESH,
    Limiter.refreshToken,
    Controller.refreshAccessToken
);


module.exports = router;