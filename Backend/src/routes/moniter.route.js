const express = require('express');
const router = express.Router();
const client = require('prom-client');


router.get('/metrics', async (req, res) => {
    res.setHeader("Content-Type", client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics);  
});

module.exports = router;