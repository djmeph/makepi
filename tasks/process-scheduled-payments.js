const _ = require('lodash');
const models = require('../models');
const config = require('../config');

module.exports = async () => {

    // First, use status-index to search all scheduled payments due before now()
    const schedules = await models.schedules.table.getAllUnpaidBeforeDate();

    // Process each scheduled payent async
    const processed = await Promise.all(schedules.map(async (schedule) => {
        // Grab userId, gonna need this a few times
        const userId = schedule.get('userId');

        // Balance should be calculated any time a payment is applied, or its status changes.
        const balance = schedule.get('balance');

        // Grab the current subscription, this will have up-to-date payment method
        const subscription = await models.subscriptions.table.get({
            userId,
            itemKey: `${config.itemKeyPrefixes.subscriptions}_latest`
        });

        // If a subscription isn't found, they've paused or cancelled their membership
        if (subscription) {

            // Get itemKey of payment method
            // Payment methods must be homogeonized to be agnostic of schema name
            const paymentMethodKey = subscription.get('paymentMethodKey');

            // Cash payment will be processed manually, leave alone.
            if (paymentMethodKey === 'cash') return false;

            // Grab schema long name from itemKey
            const [schema] = paymentMethodKey.split(config.itemKeyDelimiter);

            // Convert long schema name to function name and get payment method item
            const paymentMethod = await models[config.paymentMethods[schema]].table.get({
                userId,
                itemKey: paymentMethodKey
            });

            // If payment method was deleted, don't process the payment.
            if (!paymentMethod) return false;

            // Use homogeonous charge() method which returns amount and metadata
            const { metadata, amount } = await paymentMethod.charge({
                amount: balance,
                description: config.APP_NAME
            });

            // Instantiate and save payment item in pending status
            const payment = new models.payments.Item({
                userId,
                paymentMethodKey: {
                    userId,
                    itemKey: paymentMethodKey
                },
                amount,
                status: models.payments.config.statuses.pending,
                metadata: { ...metadata },
            });
            await payment.create();

            // Update scheduled item
            // Set status to paid
            schedule.set('status', models.schedules.config.statuses.paid);

            // Apply payment to scheduled item
            const payments = schedule.get('payments');
            payments.push({
                paymentId: payment.get('paymentId'),
                amount: balance,
            });
            schedule.set('payments', payments);

            // Update balance
            schedule.set('balance', balance - amount);

            // save scheduled item
            await schedule.update();

            // mark as processed for counter
            return true;
        }
        return false;
    }));

    console.log({ processed: _.filter(processed, (n) => n).length });
};
