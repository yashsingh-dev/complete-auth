const { MESSAGES } = require("../config/constants");
const logger = require("../config/logger.config");

module.exports.errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || MESSAGES.INTERNAL_SERVER_ERROR;

    logger.error(`[${statusCode}] Global Error: ${message}`, err.stack);

    return res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
}
