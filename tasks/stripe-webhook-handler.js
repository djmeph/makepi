const _ = require('lodash');
const models = require('../models');

module.exports = async (event) => {
    for (let i = 0; i < event.Records.length; i++) {
        await handler(JSON.parse(event.Records[i].body));
    }
};

async function handler(record) {
    console.log(record);
    switch (record.type) {
    case 'customer.created':
    case 'customer.updated':
        await updateCustomer(record);
        break;
    case 'customer.deleted':
        await deleteCustomer(record);
        break;
    case 'customer.source.created':
    case 'customer.source.updated':
        await updateSource(record);
        break;
    case 'customer.source.expiring':
        await expiringSource(record);
        break;
    case 'customer.source.deleted':
        await deleteSource(record);
        break;
    case 'customer.card.created':
    case 'customer.card.updated':
    case 'customer.bank_account.created':
    case 'customer.bank_account.updated':
        await updateSource(record);
        break;
    case 'customer.card.deleted':
    case 'customer.bank_account.deleted':
        await deleteSource(record);
        break;
    case 'charge.captured':
    case 'charge.expired':
    case 'charge.failed':
    case 'charge.pending':
    case 'charge.refunded':
    case 'charge.succeeded':
    case 'charge.updated':
    case 'charge.dispute.closed':
    case 'charge.dispute.created':
    case 'charge.dispute.funds_reinstated':
    case 'charge.dispute.funds_withdrawn':
    case 'charge.dispute.updated':
    case 'charge.refund.updated':
    default:
        console.warn(`handler not found for ${record.type}`);
    }
}

async function updateSource(message) {
    const data = _.get(message, 'data.object', {});
    if (!data.id) throw new Error('Stripe Source ID Not Found');
    const source = await models.stripePaymentMethods.table.getByStripeSourceId(data.id);
    source.set('source', data);
    await source.update();
}

async function updateCustomer(message) {
    console.log({ updateCustomer: message.type });
}

async function deleteCustomer(message) {
    console.log({ deleteCustomer: message.type });
}

async function expiringSource(message) {
    console.log({ expiringSource: message.type });
}

async function deleteSource(message) {
    console.log({ deleteSource: message.type });
}
