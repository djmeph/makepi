const models = require('../../../models');
const { stripe } = require('../../../services');
const config = require('../../../config');

module.exports = {
    method: 'POST',
    endpoint: '/stripe-payment-methods',
    access: [config.access.level.onboarding, config.access.level.member],
    validate: {
        body: models.stripePaymentMethods.schema.post.body,
        response: models.stripePaymentMethods.schema.post.response
    },
    middleware: [async (req, res, next) => {
        let customer;
        let username;

        try {
            const user = await models.users.table.get(req.user.sub);
            username = user.get('username');
        } catch (err) {
            return req.fail(err);
        }

        try {
            // Attempt to fetch customer
            customer = await stripe.customers.retrieve(req.user.sub);
        } catch (err) {
            // Create customer if they dont' exist yet
            if (err.statusCode === 404) {
                customer = await stripe.customers.create(req.user.sub, username);
            } else return req.fail(err);
        }

        try {
            // Create source and attach to customer using public token
            const source = await stripe.customers.createSource(customer.id, req.body.publicToken);

            const params = {
                userId: req.user.sub,
                source
            };

            switch (source.object) {
            case 'bank_account':
                switch (source.status) {
                case 'verified':
                    params.verified = true;
                    break;
                case 'new':
                default:
                    params.verified = false;
                }
                break;
            case 'card':
                params.verified = true;
                break;
            default:
                params.verified = false;
            }

            // Insert source data into database
            const stripePaymentMethods = new models.stripePaymentMethods.Item(params);
            await stripePaymentMethods.create();

            // Return Stripe source data
            req.data = { status: 200, response: stripePaymentMethods.get() };
            next();
        } catch (err) {
            req.fail(err);
        }
    }]
};
