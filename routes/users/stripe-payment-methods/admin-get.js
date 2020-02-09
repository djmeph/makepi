const models = require('../../../models');
const config = require('../../../config');

module.exports = {
    method: 'GET',
    endpoint: '/admin/stripe-payment-methods/:userId/:key',
    access: [config.access.level.keyMaster],
    validate: {
        params: models.stripePaymentMethods.schema.admin.get.params
    },
    middleware: [async (req, res, next) => {
        try {
            const stripeCredit = await models.stripePaymentMethods.table.get({
                userId: req.params.userId,
                itemKey: `${config.itemKeyPrefixes.stripePaymentMethods}${config.itemKeyDelimiter}${req.params.key}`
            });
            if (!stripeCredit) req.data = { status: 404, response: { message: 'Not Found' } };
            else req.data = { status: 200, response: stripeCredit.get() };
            next();
        } catch (err) { req.fail(err); }
    }]
};
