const StripeConstructor = require('stripe');
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

let stripe;

module.exports = {
    charges: {
        create: async (params) => {
            await wait(50);
            const charge = await stripe.charges.create(params);
            return charge;
        }
    },
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
        },
        verifySource: async (customerId, sourceId, amounts) => {
            await wait(50);
            const result = await stripe.customers.verifySource(customerId, sourceId, amounts);
            return result;
        }
    }
};

// Private Functions

getStripeId()
    .then(((instance) => {
        stripe = instance;
    }))
    .catch((err) => {
        throw err;
    });

async function getStripeId() {
    const result = await dynamodb.get({
        TableName: `makepi-${process.env.ENV_NAME}-settings`,
        Key: {
            settingId: 'stripe-key',
            itemKey: 'general',
        }
    }).promise();
    return StripeConstructor(result.Item.value);
}

async function wait(ms) {
    while (!stripe) {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }
}
