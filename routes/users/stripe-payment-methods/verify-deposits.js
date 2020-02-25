const models = require('../../../models');
const { stripe } = require('../../../services');
const config = require('../../../config');

module.exports = {
    method: 'POST',
    endpoint: '/stripe-payment-method-verify/:stripePaymentMethodId',
    access: [config.access.level.onboarding, config.access.level.member],
    validate: {
        params: models.stripePaymentMethods.schema.verify.params,
        body: models.stripePaymentMethods.schema.verify.body,
        response: models.stripePaymentMethods.schema.post.response
    },
    middleware: [async (req, res, next) => {
        let user;
        let stripePaymentMethod;
        let customer;

        try {
            user = await models.users.table.get(req.user.sub);
            if (!user) {
                req.data = { status: 403, response: { message: 'UNAUTHORIZED' } };
                return next();
            }
            stripePaymentMethod = await models.stripePaymentMethods.table.get({
                userId: user.get('userId'),
                itemKey: `${config.itemKeyPrefixes.stripePaymentMethods}${config.itemKeyDelimiter}${req.params.stripePaymentMethodId}`
            });
            if (!stripePaymentMethod) {
                req.data = { status: 404, response: { message: 'NOT FOUND' } };
                return next();
            }
        } catch (err) {
            return req.fail(err);
        }

        try {
            customer = await stripe.customers.retrieve(req.user.sub);
        } catch (err) {
            req.data = { status: err.statusCode, response: { message: err.message } };
            return next();
        }

        try {
            // Check verification and set to verified
            const source = await stripe.customers.verifySource(customer.id, stripePaymentMethod.get('source.id'), { amounts: req.body.amounts });
            if (source.status === 'verified') stripePaymentMethod.set('verified', true);
            stripePaymentMethod.set('source', source);
            await stripePaymentMethod.update();

            // Return Stripe source data
            req.data = { status: 200, response: stripePaymentMethod.get() };
            next();
        } catch (err) {
            req.fail(err);
        }
    }]
};
