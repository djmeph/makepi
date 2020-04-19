const config = require('../../config');

const userId = '66351cc2-7fe6-466b-8ab8-424742721561';
const balance = 50;
const paymentMethodKey = '08601afd-627f-456c-8cfc-3b0038a45401';

module.exports = {
    userId,
    paymentMethodKey: `stripe-payment-methods#${paymentMethodKey}`,
    balance,
    schedule: {
        userId,
        balance,
    },
    subscriptionCashMonthly: {
        paymentDay: 1,
        paymentMethodKey: 'cash',
        plan: {
            planId: 'monthly-membership',
            versionNumber: 1
        },
        userId
    },
    subscriptionCreditMonthly: {
        paymentDay: 1,
        paymentMethodKey,
        plan: {
            planId: 'monthly-membership',
            versionNumber: 1,
        },
        userId
    },
    subscriptionFifteenthPaymentDate: {
        paymentDay: 15,
        paymentMethodKey,
        plan: {
            planId: 'monthly-membership',
            versionNumber: 1,
        },
        userId
    },
    payment: {},
    paymentMethodCredit: {
        userId,
        source: {
            id: 'card_xxxxxxxxxxxxxxxxxxxxxxxx'
        }
    },
    plan: {
        planId: 'monthly-membership',
        versionNumber: 1,
        increments: config.payments.increments.months,
        amount: 1,
        price: balance
    }
};
