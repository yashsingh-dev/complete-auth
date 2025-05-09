const { transport, sender } = require("../config/mail.config");
const logger = require('../config/logger.config');
const { VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } = require("./emailTemplate");

module.exports.sendVerificationEmail = async (email, otp) => {

    try {
        await transport.sendMail({
            from: sender,
            to: email,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", otp),
        });

        logger.info("Verify email sent successfully");
    } catch (error) {
        logger.error(`Error sending verification email: `, error);
        throw error;
    }
}

module.exports.sendWelcomeEmail = async (email, name) => {

    try {
        await transport.sendMail({
            from: sender,
            to: [email],
            subject: `Hey ${name}! Welcome to Cortex`,
            html: WELCOME_EMAIL_TEMPLATE.replace("{userName}", name),
        });

        logger.info("Welcome email sent successfully");
    } catch (error) {
        logger.error(`Error sending welcome email: `, error);
        throw error;
    }
}

module.exports.sendPasswordResetEmail = async (email, resetURL) => {

    try {
        await transport.sendMail({
            from: sender,
            to: [email],
            subject: 'Reset your password',
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
        });

        logger.info("Reset password email sent successfully");
    } catch (error) {
        logger.error(`Error sending reset password email: `, error);
        throw error;
    }
}

module.exports.sendResetSuccessEmail = async (email) => {

    try {
        await transport.sendMail({
            from: sender,
            to: [email],
            subject: 'Password Reset Successfull',
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        });

        logger.info("Password reset successfully");
    } catch (error) {
        logger.error(`Password reset successfully error: `, error);
        throw error;
    }
}