const mongoose = require('mongoose');
const { TOKEN_EXPIRY } = require('../config/constants');

const RefreshTokenModel = mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: TOKEN_EXPIRY.REFRESH_TOKEN_MODEL
    }
});

module.exports = mongoose.model('refreshToken', RefreshTokenModel);