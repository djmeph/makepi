/* eslint-disable no-param-reassign */
module.exports = {
    JWT_SECRET: process.env.JWT_SECRET,
    EXPIRY: Number(process.env.EXPIRY),
    SALT_WORK_FACTOR: Number(process.env.SALT_WORK_FACTOR),
    MAX_LOGIN_ATTEMPTS: Number(process.env.MAX_LOGIN_ATTEMPTS),
    LOCK_TIME: Number(process.env.LOCK_TIME),
    TIMEZONE: process.env.TIMEZONE,
    APP_NAME: process.env.APP_NAME,
    NODE_ENV: process.env.NODE_ENV,
    awsConfig: {
        region: process.env.AWS_REGION,
        sslEnabled: true,
        apiVersions: {
            dynamodb: '2012-08-10'
        }
    },
    tableNames: {
        users: `makepi-${process.env.ENV_NAME}-users`,
        settings: `makepi-${process.env.ENV_NAME}-settings`,
        plans: `makepi-${process.env.ENV_NAME}-plans`,
    },
    itemKeyPrefixes: {
        users: 'base',
        stripePaymentMethods: 'stripe-payment-methods',
        subscriptions: 'subscriptions',
        settings: 'general',
        plans: 'base',
        schedules: 'schedules',
        contacts: 'contacts',
        payments: 'payments',
    },
    itemKeyDelimiter: '#',
    access: {
        level: {
            admin: 0,
            member: 1,
            keyMaster: 2,
            onboarding: 3,
        }
    },
    exceptions: ['/login', '/register', '/recover-code', '/recover-reset'],
    payments: {
        increments: {
            days: 0,
            weeks: 1,
            months: 2,
            quarters: 3,
            years: 4
        }
    },
    paymentMethods: {
        'stripe-payment-methods': 'stripePaymentMethods'
    }
};
