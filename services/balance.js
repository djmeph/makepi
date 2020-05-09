const log = require('./logger');
const models = require('../models');

class Balance {
    constructor(params = {}) {
        this.log = params.log || log;
        this.userId = params.userId;
        this.payments = [];
        this.schedules = [];
        this.sumPayments = {};
        this.sumSchedules = {};
    }

    async get() {
        await Promise.all([this.getPayments(), this.getSchedules()]);
    }

    async getPending() {
        await this.get();
        this.sumPayments = this.paymentsCounter();
        this.sumSchedules = this.schedulesCounter();
        return this.pendingBalance();
    }

    async getPayments() {
        this.payments = await models.payments.table.getAllByUserId(this.userId);
    }

    async getSchedules() {
        this.schedules = await models.schedules.table.getAllByUserId(this.userId);
    }

    paymentsCounter() {
        return this.payments.reduce((acc, payment) => {
            const statusText = payment.statusText();
            if (!statusText) return acc;
            const currentTotal = acc[statusText] ? acc[statusText] : 0;
            acc[statusText] = currentTotal + payment.get('amount', 0);
            return acc;
        }, {});
    }

    schedulesCounter() {
        return this.schedules.reduce((acc, schedule) => {
            const statusText = schedule.statusText();
            if (!statusText) return acc;
            const currentTotal = acc[statusText] ? acc[statusText] : 0;
            acc[statusText] = currentTotal + schedule.get('total', 0);
            return acc;
        }, {});
    }

    pendingBalance() {
        const pendingTotal = this.sumPayments.pending || 0;
        const completeTotal = this.sumPayments.complete || 0;
        const schedules = this.sumSchedules.paid || 0;
        const payments = pendingTotal + completeTotal;
        return {
            payments,
            schedules,
            balance: payments - schedules
        };
    }
}

module.exports = Balance;
