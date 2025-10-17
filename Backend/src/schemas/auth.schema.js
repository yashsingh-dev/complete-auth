const Ajv = require("ajv");
const { schemaValidation } = require("../lib/schemaValidation"); ``
const addFormats = require("ajv-formats");
const ajv = new Ajv();
addFormats(ajv);

const loginSchema = {
    type: "object",
    properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 6 },
        rememberMe: { type: "boolean" },
    },
    required: ["email", "password", "rememberMe"],
    additionalProperties: false,
};

const registerSchema = {
    type: "object",
    properties: {
        fullname: { type: "string", minLength: 3 },
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 6 },
    },
    required: ["fullname", "email", "password"],
    additionalProperties: false,
}

const verifyEmailSchema = {
    type: "object",
    properties: {
        token: { type: "string" },
        code: { type: "string", minLength: 6 }
    },
    required: ["token", "code"],
    additionalProperties: false,
}

const forgetPassSchema = {
    type: "object",
    properties: {
        email: { type: "string", format: "email" },
    },
    required: ["email"],
    additionalProperties: false,
}

const resetPassSchema = {
    type: "object",
    properties: {
        token: { type: "string" },
        password: { type: "string" },
    },
    required: ["token", "password"],
    additionalProperties: false,
}

const login = schemaValidation(loginSchema);
const register = schemaValidation(registerSchema);
const verifyEmail = schemaValidation(verifyEmailSchema);
const forgetPass = schemaValidation(forgetPassSchema);
const resetPass = schemaValidation(resetPassSchema);

module.exports = {
    login,
    register,
    verifyEmail,
    forgetPass,
    resetPass,
};