const router = require('express').Router();
const { API, MESSAGES } = require('../config/constants');
const apiRoutes = require('./api');

const api = API.API_PREFIX; 

// api routes
router.use(api, apiRoutes);
router.use(api, (req, res) => res.status(404).json(
    { success: false, error: MESSAGES.BAD_REQUEST }
));

module.exports = router;
