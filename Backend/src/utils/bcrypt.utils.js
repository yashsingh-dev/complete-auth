const bcrypt = require('bcryptjs');
const logger = require('../config/logger.config');

module.exports.createHash = async (input) => {
    try {
        const salt = await bcrypt.genSaltSync(10);
        const hash = await bcrypt.hashSync(input, salt);
        return hash;
    } catch (error) {
        logger.error("Error while creating hash : ", error);
        throw error;
    }
}

module.exports.verifyHash = async (input, hash) => {
    try {
        return await bcrypt.compareSync(input, hash);
    } catch (error) {
        logger.error("Error while verifying hash: ", error);
        throw error;
    }
}