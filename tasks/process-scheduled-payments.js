const _ = require('lodash');
const models = require('../models');
const config = require('../config');

module.exports = async () => {
    const schedules = await models.schedules.table.getAllUnpaidBeforeDate();

    const processed = await Promise.all(schedules.map(async (schedule) => {
        const userId = schedule.get('userId');
        const balance = schedule.get('balance');
        const subscription = await models.subscriptions.table.get({
            userId,
            itemKey: `${config.itemKeyPrefixes.subscriptions}_latest`
        });
        if (subscription) {
            const paymentMethodKey = subscription.get('paymentMethodKey');
            if (paymentMethodKey === 'cash') return false;
            const [schema] = paymentMethodKey.split(config.itemKeyDelimiter);
            const paymentMethod = await models[config.paymentMethods[schema]].table.get({
                userId,
                itemKey: paymentMethodKey
            });
            if (!paymentMethod) return false;
            const { metadata, amount } = await paymentMethod.charge({
                amount: balance,
                description: config.APP_NAME
            });
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
            schedule.set('status', models.schedules.config.statuses.paid);
            const payments = schedule.get('payments');
            payments.push({
                paymentId: payment.get('paymentId'),
                amount: balance,
            });
            schedule.set('payments', payments);
            schedule.set('balance', balance - amount);
            await schedule.update();
            return true;
        }
        return false;
    }));

    console.log({ processed: _.filter(processed, (n) => n).length });
};
