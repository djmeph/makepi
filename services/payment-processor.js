const _ = require('lodash');
const models = require('../models');
const config = require('../config');

class PaymentProcessor {

    async run() {
        await this.getAllUnpaidBeforeDate();
        await this.processScheduledPayments();
        return this.processed;
    }

    async getAllUnpaidBeforeDate() {
        this.schedules = await models.schedules.table.getAllUnpaidBeforeDate();
    }

    async processScheduledPayments() {
        this.processed = await Promise.all(this.schedules.map(this.processScheduledPayment));
    }

    async processScheduledPayment(schedule) {
        const userId = schedule.get('userId');
        const balance = await this._getBalance(schedule);
        const subscription = await this._getSubscription(userId);
        if (!subscription) return false;
        if (balance > 0) {
            const { amount, payment } = await this.schedulePayment(userId, subscription, balance);
            await this.updateScheduledItem(schedule, payment, balance, amount, models.schedules.config.statuses.paid);
            return true;
        }
        const result = await this.setSchedulePaid(schedule);
        return !!result;
    }

    async schedulePayment(userId, subscription, balance) {
        const paymentMethodKey = subscription.get('paymentMethodKey');
        if (paymentMethodKey === 'cash') return false;
        const schema = this._getSchema(paymentMethodKey);
        const paymentMethod = await this.getPaymentMethod(userId, paymentMethodKey, schema);
        if (!paymentMethod) return false;
        const { metadata, amount } = await this.charge(balance, paymentMethod);
        const payment = await this.putPaymentItem(userId, paymentMethodKey, amount, models.payments.config.statuses.pending, metadata);
        return { amount, payment };
    }

    async setSchedulePaid(schedule) {
        schedule.set('status', models.schedules.config.statuses.paid);
        await schedule.update();
    }

    getPaymentMethod(userId, paymentMethodKey, schema) {
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

    async _getBalance(schedule) {
        return schedule.get('balance');
    }

    _getSubscription(userId) {
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
