const models = require('../../../models');

module.exports = {
    method: 'GET',
    endpoint: '/stripe-payment-methods',
    validate: {
        response: models.stripePaymentMethods.schema.getAll.response
    },
    middleware: [async (req, res, next) => {
        try {
            const stripePaymentMethods = await models.stripePaymentMethods.table.getAll(req.user.sub);
            req.data = { status: 200, response: stripePaymentMethods.map((n) => n.get()) };
            next();
        } catch (err) { req.fail(err); }
    }]
};
