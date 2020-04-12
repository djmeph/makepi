const models = require('../models');
const config = require('../config');
const log = require('./logger');

class PaymentProcessor {
    constructor() {
        this.log = log;
    }

    async run() {
        await this.getAllUnpaidDue();
        await this.processScheduledPayments();
        return this.processed;
    }

    async getAllUnpaidDue() {
        this.schedules = await models.schedules.table.getAllUnpaidBeforeDate();
    }

    async processScheduledPayments() {
        this.processed = await Promise
            .all(this.schedules.map((schedule) => this.processScheduledPayment(schedule)));
    }

    async processScheduledPayment(schedule) {
        try {
            // Grab userId
            const userId = schedule.get('userId');
            // Get balance
            const balance = await this.getBalance(schedule);
            // Get current subscription
            const subscription = await this.getSubscription(userId);

            // If no subscription found do not process
            if (!subscription) return false;

            // If balance is non-zero process it
            if (balance > 0) {
                // Get Payment key. If it's cash, skip. This payment will be entered manually.
                const paymentMethodKey = subscription.get('paymentMethodKey');
                if (paymentMethodKey === 'cash') return false;
                // Process payment
                const payment = await this.processPayment(userId, paymentMethodKey, balance);
                const amount = payment.get('amount');
                // update scheduled item with payment info
                await this
                    .updateScheduledItem(schedule, payment, balance, amount, models.schedules.config.statuses.paid);
                return true;
            }

            // If zero balance mark paid
            const result = await this.setScheduleStatus(models.schedules.config.statuses.paid);
            return !!result;
        } catch (err) {
            this.log.error(err);
            return false;
        }
    }

    async processPayment(userId, paymentMethodKey, balance) {
        // Fetch payment method
        const paymentMethod = await this.getPaymentMethod(userId, paymentMethodKey);
        // If payment method doesn't exist, skip payment.
        if (!paymentMethod) return false;
        // Charge payment method and return charge info
        const { metadata, amount } = await this.charge(balance, paymentMethod);
        // Save Payment item
        const payment = await this
            .putPaymentItem(userId, paymentMethodKey, amount, models.payments.config.statuses.pending, metadata);
        // Return charge info
        return payment;
    }

    async setScheduleStatus(schedule, status) {
        schedule.set('status', status);
        await schedule.update();
    }

    getPaymentMethod(userId, paymentMethodKey) {
        const schema = this._getSchema(paymentMethodKey);
        return models[config.paymentMethods[schema]].table.get({
            userId,
            itemKey: paymentMethodKey
        });
    }

    charge(amount, paymentMethod) {
        return paymentMethod.charge({
            amount,
            description: config.APP_NAME
        });
    }

    async putPaymentItem(userId, paymentMethodKey, amount, status, metadata) {
        const payment = new models.payments.Item({
            userId,
            paymentMethodKey: {
                userId,
                itemKey: paymentMethodKey
            },
            amount,
            status,
            metadata: { ...metadata },
        });
        await payment.create();
        return payment;
    }

    async updateScheduledItem(schedule, payment, balance, amount, status) {
        // Set Status
        schedule.set('status', status);

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
    }

    // This will eventually calculate the balance based on past payments
    async getBalance(schedule) {
        return schedule.get('balance', 0);
    }

    getSubscription(userId) {
        return models.subscriptions.table.get({
            userId,
            itemKey: `${config.itemKeyPrefixes.subscriptions}_latest`
        });
    }

    _getSchema(paymentMethodKey) {
        const [schema] = paymentMethodKey.split(config.itemKeyDelimiter);
        return schema;
    }
}

module.exports = PaymentProcessor;
