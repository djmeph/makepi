const models = require('../../models');
const config = require('../../config');

const userId = '66351cc2-7fe6-466b-8ab8-424742721561';
const balance = 50;
const paymentMethodKey = '08601afd-627f-456c-8cfc-3b0038a45401';

module.exports = {
    userId,
    paymentMethodKey: `stripe-payment-methods#${paymentMethodKey}`,
    balance,
    schedule: new models.schedules.Item({
        userId,
        balance,
    }),
    subscriptionCashMonthly: new models.subscriptions.Item({
        paymentDay: 1,
        paymentMethodKey: 'cash',
        plan: {
            planId: 'monthly-membership',
            versionNumber: 1
        },
        userId
    }),
    subscriptionCreditMonthly: new models.subscriptions.Item({
        paymentDay: 1,
        paymentMethodKey,
        plan: {
            planId: 'monthly-membership',
            versionNumber: 1,
        },
        userId
    }),
    subscriptionFifteenthPaymentDate: new models.subscriptions.Item({
        paymentDay: 15,
        paymentMethodKey,
        plan: {
            planId: 'monthly-membership',
            versionNumber: 1,
        },
        userId
    }),
    payment: new models.payments.Item({}),
    paymentMethodCredit: new models.stripePaymentMethods.Item({
        userId,
        source: {
            id: 'card_xxxxxxxxxxxxxxxxxxxxxxxx'
        }
    }),
    plan: new models.plans.Item({
        planId: 'monthly-membership',
        versionNumber: 1,
        increments: config.payments.increments.months,
        amount: 1,
        price: balance
    })
};
