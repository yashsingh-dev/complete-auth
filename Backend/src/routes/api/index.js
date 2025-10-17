const router = require('express').Router();
const { API } = require('../../config/constants');
const authRoutes = require('./auth.route');

// auth routes
router.use(API.AUTH.BASE, authRoutes);


module.exports = router;
