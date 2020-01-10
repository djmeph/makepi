const StripeConstructor = require('stripe');
const models = require('../models');

let stripe;

const service = {
    customers: {
        retrieve: async (id) => {
            await wait(50);
            const customer = await stripe.customers.retrieve(id);
            return customer;
        },
        create: async (id, email) => {
            await wait(50);
            const customer = await stripe.customers.create({ id, email });
            return customer;
        },
        createSource: async (id, source) => {
            await wait(50);
            const result = await stripe.customers.createSource(id, { source });
            return result;
        },
        deleteSource: async (customerId, sourceId) => {
            await wait(50);
            const result = await stripe.customers.deleteSource(customerId, sourceId);
            return result;
        }
    }
};

module.exports = service;

// Private Functions

getStripeId()
    .then(((instance) => {
        stripe = instance;
    }))
    .catch((err) => {
        throw err;
    });

async function getStripeId() {
    const { value } = await models.settings.table.get('stripe-key');
    return StripeConstructor(value);
}

async function wait(ms) {
    while (!stripe) {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }
}
