module.exports = {
    MESSAGES: {
        USER_NOT_FOUND: "User not found",
        LOGIN_SUCCESS: "Login successfully",
        LOGOUT_SUCCESS: "Logout successfully",
        LOGOUT_ALL_SUCCESS: "All Logout successfully",
        USER_EXISTS: "User already exists",
        ACCOUNT_CREATED_SUCCESS: "Account created successfully",
        UNAUTH: "Unauthorized",
        INVALID_EMAIL_PASSWORD: "Invalid email or password",
        INTERNAL_SERVER_ERROR: "Internal Server Error",
        TOKEN_REFRESH: "Tokens refreshed successfully",
        LOGIN_TOO_MANY_ATTEMPTS: "Too many login attempts from this IP, please try again later",
        ACCESS_TOKEN_MISSING: "Access token missing",
        REFRESH_TOKEN_MISSING: "Refresh token missing",
        TOKEN_REVOKE: "Token has been revoked",
        OTP_EXPIRE: "Otp has been expired",
        OTP_SEND: "Otp sent successfully",
        INCORRECT_OTP: "Incorrect Otp",
        OTP_VERIFIED: "Email verification successfull",
    },
    ROLES: {
        ADMIN: "admin",
        USER: "user"
    },
    COOKIES: {
        // For Cookie we need time in milli second
        ACCESS_TOKEN: "accessToken",
        REFRESH_TOKEN: "refreshToken",
        ACCESS_TOKEN_AGE_MS: 10 * 60 * 1000, // 10 min
        REFRESH_TOKEN_AGE_MS: 10 * 24 * 60 * 60 * 1000, // 10 days
        REFRESH_TOKEN_SHORT_AGE_MS: 1 * 60 * 60 * 1000, // 1 hours
    },
    TOKEN_EXPIRY: {
        ACCESS_TOKEN: '10m',
        REFRESH_TOKEN_SHORT: '1h',
        REFRESH_TOKEN: '10d',
        ACCESS_TOKEN_MS: 10 * 60 * 1000, // 10 min
        REFRESH_TOKEN_MODEL: 10 * 24 * 60 * 60, // 10 days
        BLACKLIST_TOKEN_MODEL: 10 * 60 // 10 min
    },
    OTP: {
        LENGTH: 6,
        EXPIRY_MODEL: 15 * 60,
        EMAIL_VERIFY: 'email-verification',
        PASSWORD_RESET: 'password-reset',
        FORGET_PASSWORD: 'forget-password',
    },
    FORGET_PASS: {
        EXPIRY_MS: Date.now() + 15 * 60 * 1000,
    }
};
