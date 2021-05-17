const moment = require('moment-timezone');
const _ = require('lodash');
const log = require('./logger');
const models = require('../models');

class Balance {
    constructor(params = {}) {
        this.log = params.log || log;
        this.userId = params.userId;
        this.payments = [];
        this.schedules = [];
        this.subscriptionHistory = [];
        this.currentSubscription;
        this.sumPayments = {};
        this.sumSchedules = {};
    }

    async get() {
        await Promise.all([
            this.getPayments(),
            this.getSchedules(),
            this.getSubscriptionHistory(),
            this.getCurrentSubscription(),
        ]);
    }

    async getPending() {
        await this.get();
        await this.walkSubscription();
        // this.sumPayments = this.paymentsCounter();
        // this.sumSchedules = this.schedulesCounter();
        return this.pendingBalance();
    }

    async getPayments() {
        this.payments = await models.payments.table.getAllByUserId(this.userId);
        // console.log({ end: 'getPayments' })
    }

    async getSchedules() {
        this.schedules = await models.schedules.table.getAllByUserId(this.userId);
        // console.log({ end: 'getSchedules' })
    }

    async getSubscriptionHistory() {
        this.subscriptionHistory = await models.subscriptions.table.getAllByUserId(this.userId);
        // console.log(this.subscriptionHistory.map(n => n.get()))

    }

    async getCurrentSubscription() {
        this.currentSubscription = await models.subscriptions.table.getLatest(this.userId);
        // console.log(this.currentSubscription.get())
    }

    async walkSubscription() {
        let netDues = 0;
        if (!this.subscriptionHistory.length) return netDues;
        const walker = this._getWalker();

        console.log({ walker })

        const subscriptions = await this._getUniqueSubscriptions();

        console.log(subscriptions);

        const cancellations = this._getCancellations(subscriptions);

        console.log(cancellations);

        // cancellations =
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

    _getWalker() {
        const startDate = moment(this.subscriptionHistory[0].get('createdAt'));
        const now = moment();
        const startMonth = startDate.month();
        const startYear = startDate.year();
        const nowMonth = now.month();
        const nowYear = now.year();
        const walker = {
            currentMonth: startMonth,
            currentYear: startYear,
            monthsToNow: 0
        };

        // This calculates the total number of months
        while (
            moment()
                .month(walker.currentMonth)
                .year(walker.currentYear)
                .isBefore(
                    moment()
                        .month(nowMonth)
                        .year(nowYear)
                )
        ) {
            walker.monthsToNow++;
            const nextMonth = moment()
                .month(walker.currentMonth)
                .year(walker.currentYear)
            nextMonth.add(1, 'month');
            walker.currentMonth = nextMonth.month();
            walker.currentYear = nextMonth.year();
        }
        return walker;
    }

    async _getUniqueSubscriptions() {
        let subscriptions = _.uniqWith(this.subscriptionHistory.map((n) => n.get('plan')), _.isEqual);
        subscriptions = _.filter(subscriptions, (n) => n.planId !== 'cancel');
        subscriptions = await Promise.all(subscriptions.map((planKey) => models.plans.table.get(planKey)));
        subscriptions = subscriptions.map((n) => n.get());
        return subscriptions;
    }

    _getCancellations(subscriptions) {
        let cancellations = [];

        this.subscriptionHistory.forEach((n) => {
            const paymentDate = n.get('createdAt');
            const planKey = n.get('plan');
            console.log(planKey)
            if (planKey.planId === 'cancel') cancellations.push({ start: paymentDate });
            else {
                const subscription = _.filter(subscriptions, planKey)[0];
                const lastCancellation = _.last(cancellations);
                if (_.get(lastCancellation, 'start') && !_.get(lastCancellation, 'end')) {
                    lastCancellation.end = paymentDate;
                }
            }
        });

        cancellations = _
            .filter(cancellations, (n) => moment(n.end).diff(moment(n.start), 'days') > 30);

        return cancellations;
    }
}

module.exports = Balance;
