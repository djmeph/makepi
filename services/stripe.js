const StripeConstructor = require('stripe');
const models = require('../models');

module.exports = {
    customers: {
        retrieve: async (id) => {
            const { value: stripeKey } = await models.settings.table.get('stripe-key');
            const stripe = StripeConstructor(stripeKey);
            const customer = await stripe.customers.retrieve(id);
            return customer;
        },
        create: async (id, email) => {
            const { value: stripeKey } = await models.settings.table.get('stripe-key');
            const stripe = StripeConstructor(stripeKey);
            const customer = await stripe.customers.create({ id, email });
            return customer;
        },
        createSource: async (id, source) => {
            const { value: stripeKey } = await models.settings.table.get('stripe-key');
            const stripe = StripeConstructor(stripeKey);
            const result = await stripe.customers.createSource(id, { source });
            return result;
        }
    }
};
