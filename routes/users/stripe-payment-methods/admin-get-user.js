const models = require('../../../models');
const config = require('../../../config');

module.exports = {
    method: 'GET',
    endpoint: '/admin/stripe-payment-methods/:userId',
    access: [config.access.level.keyMaster],
    validate: {
        params: models.stripePaymentMethods.schema.admin.getUser.params
    },
    middleware: [async (req, res, next) => {
        try {
            const stripeCredits = await models.stripePaymentMethods.table.getAll(req.params.userId);
            req.data = { status: 200, response: stripeCredits.map((n) => n.get()) };
            next();
        } catch (err) { req.fail(err); }
    }]
};
