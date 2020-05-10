const models = require('../models');
const config = require('../config');
const { sqs, stripe } = require('../services');

module.exports = async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        const message = await stripe.webhooks.constructEvent(req.body, signature, config.STRIPE_SIGNING_SECRET);
        const { value: url } = await models.settings.table.get('sqs-stripe-webhook-url');
        await sqs.send({ message, url });
        res.status(200).send('OK');
    } catch (err) {
        console.error(err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};
