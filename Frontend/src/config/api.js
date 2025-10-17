const API_PREFIX = '/api/v1';

export const API = {
    API_PREFIX: API_PREFIX,
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        PASSWORD_FORGOT: '/auth/forgot',
        PASSWORD_RESET: '/auth/reset/:token',
        TOKEN_REFRESH: '/auth/token/refresh',
        EMAIL_VERIFY: '/auth/verification',
        STATUS: '/auth/status',
        GOOGLE: '/auth/google',
        GOOGLE_ONETAP: '/auth/google/onetap',
        FACEBOOK: '/auth/facebook',
    },
};