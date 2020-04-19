const moment = require('moment-timezone');
const models = require('../models');
const config = require('../config');
const log = require('./logger');

class PaymentScheduler {
    constructor(params = {}) {
        this.log = params.log || log;
        this.now = params.now ? moment(params.now) : moment();
        this.timezone = params.timezone ? params.timezone : config.TIMEZONE;
    }

    async run() {
        await this.getAllSubscriptions();
        await this.processSubscriptions();
        return this.processed;
    }

    async getAllSubscriptions() {
        this.subscriptions = await models.subscriptions.table.getAllLatest();
    }

    async processSubscriptions() {
        this.processed = await Promise
            .all(this.subscriptions.map((subscription) => {
                const userId = subscription.get('userId');
                const planKey = subscription.get('plan');
                if (planKey.planId === 'cancel') return false;
                return this.processSubscription(userId, subscription);
            }));
    }

    async processSubscription(userId, subscription) {
        try {
            const planKey = subscription.get('plan');
            const paymentDay = subscription.get('paymentDay');
            const paymentMethodKey = subscription.get('paymentMethodKey');
            // Don't schedule cash payments yet. Need to turn this into an env var parameter.
            if (paymentMethodKey === 'cash') {
                this.log.info({ userId, paymentMethodKey });
                return false;
            }
            // Look for all future schedule items by userId
            const schedules = await this.getSchedulesByUserIdAndStatus(userId, models.schedules.config.statuses.unpaid);
            // If array returns with 1 or more items, ignore.
            if (schedules.length) {
                this.log.info({ userId, message: 'SCHEDULE(S) FOUND' });
                return false;
            }
            // get subscription info and calculate payment date
            const thisMonthsPaymentDay = moment()
                .year(this.now.year())
                .month(this.now.month())
                .date(paymentDay);
            if (thisMonthsPaymentDay.isBefore(this.now)) thisMonthsPaymentDay.add(1, 'months');
            const paymentDate = moment
                .tz(thisMonthsPaymentDay.format('YYYY-MM-DD'), 'YYYY-MM-DD', this.timezone);
            // retrieve plan
            const plan = await this.getPlan(planKey);
            // extract plan info
            const increments = plan.get('increments');
            const amount = plan.get('amount');
            const total = plan.get('price');
            // Finally, save schedule item to database
            await this.saveScheduleItem(userId, paymentDate, increments, amount, total);
            this.log.info({ userId, message: 'PAYMENT SCHEDULED' });
            // return true to include in the `scheduled` count
            return paymentDate.toISOString();
        } catch (err) {
            this.log.error({ userId }, err);
            return false;
        }
    }

    getSchedulesByUserIdAndStatus(userId, status) {
        return models.schedules.table.getByUserIdAndStatus({
            userId,
            status
        });
    }

    getPlan({ planId, versionNumber }) {
        return models.plans.table.get({
            planId,
            itemKey: `${config.itemKeyPrefixes.plans}_v${versionNumber}`,
        });
    }

    async saveScheduleItem(userId, paymentDate, increments, amount, total) {
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
        return schedule;
    }
}

module.exports = PaymentScheduler;
