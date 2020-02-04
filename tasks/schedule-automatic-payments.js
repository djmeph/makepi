const moment = require('moment-timezone');
const _ = require('lodash');
const models = require('../models');
const config = require('../config');

module.exports = async () => {

    // Fetch all current Subscriptions, which will have an itemKey of subscriptions_latest
    const subscriptions = await models.subscriptions.table.getAllLatest();

    // Process subscriptions async.
    const processed = await Promise.all(subscriptions.map(async (subscription) => {
        // Pull userId, which is used multiple times.
        const userId = subscription.get('userId');

        try {
            // Look for all future schedule items by userId
            const schedules = await models.schedules.table.getLatestByUserIdAfterDate({
                userId,
                paymentDate: moment().toISOString(),
            });

            // If empty array returned, there are no schedule items. Create one.
            if (!schedules.length) {

                // Deconstruct plan info from subscription and use to fetch selected plan
                const { planId, versionNumber } = subscription.get('plan');
                const plan = await models.plans.table.get({
                    planId,
                    itemKey: `${config.itemKeyPrefixes.plans}_v${versionNumber}`,
                });

                // Get payment day of month setting
                const paymentDay = subscription.get('paymentDay');

                // Calculate the payment date, if it's in the past, add 1 month.
                // Need to write a test to make sure this works for annual plans
                // But the idea here is that payments are scheduled on a monthly
                // basis for now.
                const now = moment();
                const thisMonthsPaymentDay = moment()
                    .year(now.year())
                    .month(now.month())
                    .date(paymentDay);
                if (thisMonthsPaymentDay.isBefore(now)) thisMonthsPaymentDay.add(1, 'months');

                // Use timezone setting to calculate 00:00:000 on the payment day, in the selected timezone
                // Since this value is saved in local time with a timezone offset, do the same when searching paymentDate-index
                const paymentDate = moment.tz(thisMonthsPaymentDay.format('YYYY-MM-DD'), 'YYYY-MM-DD', config.TIMEZONE);

                // Save information about the price, and the amount at the selected increment this scheduled payment will apply to
                const increments = plan.get('increments');
                const amount = plan.get('amount');
                const total = plan.get('price');

                // Finally, instantiate the new schedule item and save
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

                // return true to include in the `scheduled` count
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
