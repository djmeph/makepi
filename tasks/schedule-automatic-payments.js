const moment = require('moment-timezone');
const _ = require('lodash');
const models = require('../models');
const config = require('../config');

module.exports = async () => {
    const subscriptions = await models.subscriptions.table.getAllLatest();

    const processed = await Promise.all(subscriptions.map(async (subscription) => {
        const userId = subscription.get('userId');
        try {
            const schedules = await models.schedules.table.getLatestByUserIdAfterDate({
                userId,
                paymentDate: moment().toISOString(),
            });
            if (!schedules.length) {
                const { planId, versionNumber } = subscription.get('plan');
                const plan = await models.plans.table.get({
                    planId,
                    itemKey: `${config.itemKeyPrefixes.plans}_v${versionNumber}`,
                });
                const paymentDay = subscription.get('paymentDay');
                const now = moment();
                const thisMonthsPaymentDay = moment()
                    .year(now.year())
                    .month(now.month())
                    .date(paymentDay);
                if (thisMonthsPaymentDay.isBefore(now)) thisMonthsPaymentDay.add(1, 'months');
                const paymentDate = moment.tz(thisMonthsPaymentDay.format('YYYY-MM-DD'), 'YYYY-MM-DD', config.TIMEZONE);
                const increments = plan.get('increments');
                const amount = plan.get('amount');
                const total = plan.get('price');
                const schedule = new models.schedules.Item({
                    userId,
                    paymentDate: paymentDate.format(),
                    increments,
                    amount,
                    status: models.schedules.config.statuses.unpaid,
                    payments: [],
                    total,
                    balance: total,
                });
                await schedule.create();
                return true;
            }
            return false;
        } catch (err) {
            console.log({ userId });
            console.error(err);
        }
    }));

    console.log({ scheduled: _.filter(processed, (n) => n).length });
};
