const bcrypt = require('bcrypt');
const logger = require('../config/logger.config');

module.exports.createHash = async (input) => {
    try {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(input, salt);
        return hash;
    } catch (error) {
        logger.error("Error while creating hash : ", error);
        throw error;
    }
}

module.exports.verifyHash = async (input, hash) => {
    try {
        return await bcrypt.compare(input, hash);
    } catch (error) {
        logger.error("Error while verifying hash: ", error);
        throw error;
    }
}