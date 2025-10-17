const dotenv = require('dotenv-safe');
const Joi = require('joi');
const logger = require('../config/logger.config');

// TODO Production
dotenv.config({
  example: '.env.example',
  allowEmptyValues: false
});

// Schema validation using Joi
const envSchema = Joi.object({
  MONGO_URI: Joi.string().uri().required(),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().required(),
  EMAIL_USER: Joi.string().email().required(),
  EMAIL_ADDRESS: Joi.string().email().required(),
  EMAIL_PASS: Joi.string().required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required()
}).unknown();

const { error } = envSchema.validate(process.env);
if (error) {
  logger.error("Invalid .env configuration:", error);
  process.exit(1);
}
