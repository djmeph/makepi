/* MakePI Webhooks */

const bodyParser = require('body-parser');
const express = require('express');
const stripe = require('./stripe');

const router = express.Router();
router.post('/stripe', stripe);

const webhooks = express();

webhooks.use(bodyParser.json({ type: 'application/json' }));
webhooks.use('/api', router);
webhooks.use((req, res) => res.status(404).send('NOT FOUND'));
webhooks.use((err, req, res) => res.status(500).send('ERROR'));

module.exports = webhooks;
