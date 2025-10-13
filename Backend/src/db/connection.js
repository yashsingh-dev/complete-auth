const mongoose = require('mongoose');
const logger = require('../config/logger.config');

async function dbConnection() {
    try {
        await mongoose.connect(process.env.DB_URL);
        logger.info('Database Connected')
    } catch (error) {
        logger.error('Error in database connection: ', error.message);
        process.exit(1);
    }
}

module.exports = dbConnection;