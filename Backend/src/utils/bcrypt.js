const bcrypt = require('bcrypt');

module.exports.getHashPassword = async (textPassword) => {
    try {
        const salt = await bcrypt.genSalt();
        const encPassword = await bcrypt.hash(textPassword, salt);
        return encPassword;
    } catch (error) {
        console.log("Error while Encrypting Password: ", error);
    }
}

module.exports.comparePassword = async ({ textPassword, hashPassword }) => {
    try {
        return await bcrypt.compare(textPassword, hashPassword);
    } catch (error) {
        console.log("Error while Comparing Password: ", error);
        return false;
    }
}