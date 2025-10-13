const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const logger = require('../config/logger.config');
const ajv = new Ajv();
addFormats(ajv);

const schemaValidation = (schema) => {

    const validate = ajv.compile(schema);

    return (req, res, next) => {
        const valid = validate(req.body);
        if (!valid) {
            logger.error("Validation Error:\n" + JSON.stringify(validate.errors, null, 2));
            return res.status(400).json({ success: false, error: validate.errors });
        }
        next();
    };
}

module.exports = { schemaValidation };