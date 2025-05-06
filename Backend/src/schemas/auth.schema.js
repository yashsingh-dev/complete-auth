const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const ajv = new Ajv();
addFormats(ajv);

module.exports.loginSchema = (req, res, next) => {
    const schema = {
        type: "object",
        properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            rememberMe: { type: "boolean" },
        },
        required: ["email", "password", "rememberMe"],
        additionalProperties: false,
    }

    const data = req.body;

    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
        console.log("Validation Error: ", validate.errors)
        return res.status(400).json({ "Validation Error": validate.errors })
    };
    next();
}

module.exports.signUpSchema = (req, res, next) => {
    const schema = {
        type: "object",
        properties: {
            fullname: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
        },
        required: ["fullname", "email", "password"],
        additionalProperties: false,
    }

    const data = req.body;

    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
        console.log("Validation Error: ", validate.errors)
        return res.status(400).json({ "Validation Error": validate.errors })
    };
    next();
}

module.exports.verifyEmailSchema = (req, res, next) => {
    const schema = {
        type: "object",
        properties: {
            code: { type: "string" }
        },
        required: ["code"],
        additionalProperties: false,
    }

    const data = req.body;

    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
        console.log("Validation Error: ", validate.errors)
        return res.status(400).json({ "Validation Error": validate.errors })
    };
    next();
}

module.exports.forgetPassSchema = (req, res, next) => {
    const schema = {
        type: "object",
        properties: {
            email: { type: "string", format: "email" },
        },
        required: ["email"],
        additionalProperties: false,
    }

    const data = req.body;

    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
        console.log("Validation Error: ", validate.errors)
        return res.status(400).json({ "Validation Error": validate.errors })
    };
    next();
}

module.exports.resetPassSchema = (req, res, next) => {
    const schema = {
        type: "object",
        properties: {
            token: { type: "string" },
            password: { type: "string" },
        },
        required: ["token", "password"],
        additionalProperties: false,
    }

    const data = req.body;

    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
        console.log("Validation Error: ", validate.errors)
        return res.status(400).json({ "Validation Error": validate.errors })
    };
    next();
}