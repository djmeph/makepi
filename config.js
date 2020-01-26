/* eslint-disable no-param-reassign */
module.exports = {
    JWT_SECRET: process.env.JWT_SECRET,
    EXPIRY: Number(process.env.EXPIRY),
    SALT_WORK_FACTOR: Number(process.env.SALT_WORK_FACTOR),
    MAX_LOGIN_ATTEMPTS: Number(process.env.MAX_LOGIN_ATTEMPTS),
    LOCK_TIME: Number(process.env.LOCK_TIME),
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
        contacts: 'contacts'
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
    exceptions: ['/login', '/register', '/recover-code', '/recover-reset']
};
