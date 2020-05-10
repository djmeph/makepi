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
    case 'source.canceled':
    case 'source.chargeable':
    case 'source.failed':
    case 'source.mandate_notification':
    case 'source.refund_attributes_required':
    case 'source.transaction.created':
    case 'source.transaction.updated':
        await updateSource(record);
        break;
    case 'payment_method.attached':
    case 'payment_method.card_automatically_updated':
    case 'payment_method.detached':
    case 'payment_method.updated':
    case 'customer.created':
    case 'customer.deleted':
    case 'customer.updated':
    case 'customer.source.created':
    case 'customer.card.created':
    case 'customer.bank_account.created':
    case 'customer.source.deleted':
    case 'customer.card.deleted':
    case 'customer.bank_account.deleted':
    case 'customer.source.expiring':
    case 'customer.source.updated':
    case 'customer.card.updated':
    case 'customer.bank_account.updated':
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
