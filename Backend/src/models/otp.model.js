const mongoose = require("mongoose");
const { OTP } = require("../config/constants");

const otpSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    code: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: OTP.EXPIRY_MODEL
    },
    type: {
        type: String,
        enum: [OTP.EMAIL_VERIFY, OTP.FORGET_PASSWORD, OTP.PASSWORD_RESET],
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('otp', otpSchema);