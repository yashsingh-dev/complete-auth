module.exports = {
    MESSAGES: {
        USER_NOT_FOUND: "user_not_found",
        LOGIN_SUCCESS: "login_successfully",
        SIGNUP_SUCCESS: "signup_successfully",
        GOOGLE_LOGIN: "logged_in_with_Google",
        LOGIN_WITH_GOOGLE: "please_login_with_google",
        LOGOUT_SUCCESS: "logout_successfully",
        LOGOUT_ALL_SUCCESS: "all_logout_successfully",
        USER_EXISTS: "user_already_exists",
        ACCOUNT_CREATED_SUCCESS: "account_created_successfully",
        UNAUTH: "unauthorized",
        AUTH: "authorized",
        INVALID_EMAIL_PASSWORD: "invalid_email_or_password",
        INTERNAL_SERVER_ERROR: "internal_server_error",
        TOKEN_REFRESH: "tokens_refreshed_successfully",
        TOO_MANY_REQUEST: 'too_many_requests_please_slow_down',
        TOO_MANY_LOGIN_REQUEST: 'too_many_login_requests_try_after_some_time',
        TOO_MANY_SIGNUP_REQUEST: 'too_many_signup_requests_try_after_some_time',
        ACCESS_TOKEN_MISSING: "access_token_missing",
        REFRESH_TOKEN_MISSING: "refresh_token_missing",
        INVALID_REFRESH_TOKEN: "invalid_refresh_token",
        SESSION_EXPIRE: "session_expired_please_login_again",
        TOKEN_REVOKE: "token_has_been_revoked",
        OTP_EXPIRE: "otp_has_been_expired",
        OTP_SEND: "otp_sent_successfully",
        INCORRECT_OTP: "incorrect_otp",
        INVALID_TOKEN: "invalid_token",
        LINK_EXPIRE: "link_expired",
        PASSWORD_RESET: "password_reset_successfully",
        OTP_VERIFIED: "email_verification_successfull",
        TOKEN_EXPIRE: "token_expired_please_login_again",
        PASS_RESET_LINK: "Password_reset_link_sent_to_your_email",
    },
    ROLES: {
        ADMIN: "admin",
        USER: "user"
    },
    COOKIES: {
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
        LENGTH: 6, // Do not change
        EXPIRY_MODEL: 15 * 60
    },
    FORGET_PASS: {
        EXPIRY_MS: Date.now() + 15 * 60 * 1000,
    }
};
