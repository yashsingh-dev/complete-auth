const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Make sure log directory exists
const logDirectory = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// 🌈 Custom colors with background styles
const customColors = {
    info: 'black bgGreen',
    warn: 'black bgYellow',
    error: 'white bgRed',
    debug: 'white bgBlue',
};
require('winston').addColors(customColors);

const isProduction = (process.env.NODE_ENV || 'development') === 'production';

const logger = createLogger({
    level: isProduction ? 'info' : 'debug',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    transports: [
        new transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(logDirectory, 'combined.log') }),
    ],
});

// 🎨 Console logger with background colors for levels
if (!isProduction) {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize({ all: true }), // Color entire log line
            format.printf(({ timestamp, level, message, stack }) => {
                const logMsg = `[${timestamp}] ${level}: ${message}`;
                return stack ? `${logMsg}\n${stack}` : logMsg;
            })
        ),
    }));
}

module.exports = logger;
