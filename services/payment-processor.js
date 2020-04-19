const models = require('../models');
const config = require('../config');
const log = require('./logger');

class PaymentProcessor {
    constructor(params = {}) {
        this.log = params.log || log;
        this.ses = require('./ses');
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
        this.log.info({ scheduleIds: this.schedules.map((n) => n.get('scheduleId')), message: 'Processing ...' });
        this.processed = await Promise
            .all(this.schedules.map((schedule) => this.processScheduledPayment(schedule)));
    }

    async processScheduledPayment(schedule) {
        // Grab userId
        const userId = schedule.get('userId');
        const scheduleId = schedule.get('scheduleId');
        this.log.info({ userId, scheduleId, message: 'processScheduledPayment' });
        try {
            // Get balance
            const balance = await this.getBalance(schedule);
            // Get current subscription
            const subscription = await this.getSubscription(userId);

            // If no subscription found do not process
            if (!subscription) {
                this.log.info({ userId, scheduleId, message: 'NO SUBSCRIPTION FOUND' });
                return false;
            }

            // If balance is non-zero process it
            if (balance > 0) {
                // Get Payment key. If it's cash, skip. This payment will be entered manually.
                const paymentMethodKey = subscription.get('paymentMethodKey');
                if (paymentMethodKey === 'cash') {
                    this.log.info({ userId, scheduleId, message: 'CASH PAYMENT SELECTED' });
                    return false;
                }
                // Process payment
                try {
                    const payment = await this.processPayment(userId, paymentMethodKey, balance);
                    const amount = payment.get('amount');
                    // update scheduled item with payment info
                    await this
                        .updateScheduledItem(schedule, payment, balance, amount, models.schedules.config.statuses.paid);
                    this.log.info({ userId, scheduleId, message: 'PAID IN FULL' });
                    // Send success email
                    await this.paymentSuccessEmail(userId, amount);
                    return true;
                } catch (err) {
                    // Add failure object to schedule item
                    schedule.set('failure', { ...err });
                    await schedule.update();
                    // Send failure email
                    await this.paymentFailedEmail(userId, balance, err.errorMessage);
                    throw err;
                }
            }

            // If zero balance mark paid
            const result = await this.setScheduleStatus(models.schedules.config.statuses.paid);
            this.log.info({ userId, scheduleId, message: 'ZERO BALANCE MARKED PAID' });
            return !!result;
        } catch (err) {
            this.log.error({ userId }, err);
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

    async paymentSuccessEmail(userId, amount) {
        try {
            const sourceEmail = await models.settings.table.get('source-email');
            const user = await models.users.table.get(userId);
            if (!user) throw new Error('User not found');
            const email = user.get('username');
            await this.ses.send({
                to: [email],
                from: sourceEmail.value,
                subject: `MakePI: ${config.APP_NAME} Payment Success`,
                textBody: `Your payment of $${amount} was successfully charged.`,
            });
        } catch (err) {
            this.log.error({ userId }, err);
        }
    }

    async paymentFailedEmail(userId, amount, reason) {
        try {
            const sourceEmail = await models.settings.table.get('source-email');
            const user = await models.users.table.get(userId);
            if (!user) throw new Error('User not found');
            const email = user.get('username');
            await this.ses.send({
                to: [email],
                from: sourceEmail.value,
                subject: `MakePI: ${config.APP_NAME} Payment Failure`,
                textBody: [
                    `Your payment of $${amount} failed.`,
                    `Reason: ${reason}`,
                    [
                        'We will attempt your payment again tomorrow.',
                        'Re-check your account settings to change your payment method or cancel further attempts.'
                    ].join(' ')
                ].join('\n\n')
            });
        } catch (err) {
            this.log.error({ userId }, err);
        }
    }

    _getSchema(paymentMethodKey) {
        const [schema] = paymentMethodKey.split(config.itemKeyDelimiter);
        return schema;
    }
}

module.exports = PaymentProcessor;
