const mongoose = require('mongoose');

const userModel = mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false,
        minLength: [6, "Password must be atleast 3 character long"]
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('user', userModel);