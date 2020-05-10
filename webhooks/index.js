/* MakePI Webhooks */

const express = require('express');
const stripe = require('./stripe');

const router = express.Router();
router.post('/stripe', stripe);

module.exports = router;
