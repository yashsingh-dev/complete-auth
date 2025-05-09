const mongoose = require('mongoose');
const logger = require('../config/logger.config');

function dbConnection() {
    mongoose.connect(process.env.DB_URL)
        .then(logger.info('Database Connected'))
        .catch((error) => logger.error('Error in database connection: ', error));
}

module.exports = dbConnection;