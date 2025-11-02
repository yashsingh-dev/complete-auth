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
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: OTP.EXPIRY_MODEL
    }
}, { timestamps: true });

module.exports = mongoose.model('otp', otpSchema);