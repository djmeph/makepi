const models = require('../../../models');
const config = require('../../../config');

module.exports = {
    method: 'GET',
    endpoint: '/stripe-payment-methods/:key',
    validate: {
        response: models.stripePaymentMethods.schema.get.response
    },
    middleware: [async (req, res, next) => {
        try {
            const stripeCredit = await models.stripePaymentMethods.table.get({
                userId: req.user.sub,
                key: `${config.keyPrefixes.stripePaymentMethods}${config.keyDelimiter}${req.params.key}`
            });
            if (!stripeCredit) req.data = { status: 404, response: { message: 'Not Found' } };
            else req.data = { status: 200, response: stripeCredit.get() };
            next();
        } catch (err) { req.fail(err); }
    }]
};
