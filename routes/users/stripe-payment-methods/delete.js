const models = require('../../../models');
const config = require('../../../config');
const { stripe } = require('../../../services');

module.exports = {
    method: 'DELETE',
    endpoint: '/stripe-payment-methods/:key',
    middleware: [async (req, res, next) => {
        try {
            const stripeCredit = await models.stripePaymentMethods.table.get({
                userId: req.user.sub,
                itemKey: `${config.itemKeyPrefixes.stripePaymentMethods}${config.itemKeyDelimiter}${req.params.key}`
            });
            if (!stripeCredit) {
                req.data = { status: 404, response: { message: 'Not Found' } };
                return next();
            }
            await stripe.customers.deleteSource(req.user.sub, stripeCredit.get('source.id'));
            stripeCredit.delete((err) => {
                if (err) return req.fail(err);
                req.data = { status: 200 };
                next();
            });
        } catch (err) { req.fail(err); }
    }]
};
