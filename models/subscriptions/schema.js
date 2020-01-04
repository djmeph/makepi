const DB = require('dynamodb-wrapper');
const config = require('../../config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const userId = joi.string()
    .description('User ID');

const itemKey = joi.string()
    .description('Subscription Key');

const planId = joi.string()
    .description('Plan ID');

const versionNumber = joi.number()
    .description('Plan Version Number');

const stripePaymentMethodId = joi.string()
    .description('Unique ID for Stripe Payment Method Item');

const paymentDay = joi.number().integer().min(1).max(28)
    .description('Day of month to process payment');

const output = joi.object({
    plan: joi.object({
        planId: planId.required(),
        versionNumber: versionNumber.required()
    }).optional(),
    stripePaymentMethodId: stripePaymentMethodId.optional(),
    versionNumber: versionNumber.optional(),
    paymentDay: paymentDay.optional(),
    message: joi.string().optional(),
});

module.exports = {
    elements: {
        userId,
        itemKey,
        plan: {
            planId,
            versionNumber
        },
        stripePaymentMethodId,
        paymentDay
    },
    post: {
        body: joi.object({
            plan: joi.object({
                planId: planId.required(),
                versionNumber: versionNumber.required()
            }),
            stripePaymentMethodId: stripePaymentMethodId.required(),
            paymentDay: paymentDay.required()
        })
    },
    get: {
        response: output
    },
    dynamo: new Schema({
        tableName: config.tableNames.users,
        key: {
            hash: 'userId',
            range: 'itemKey'
        },
        timestamps: true,
        schema: {
            userId: userId.required(),
            itemKey: itemKey.required(),
            plan: joi.object({
                planId: planId.required(),
                versionNumber: versionNumber.required()
            }).required(),
            stripePaymentMethodId: stripePaymentMethodId.required(),
            versionNumber: versionNumber.required(),
            paymentDay: paymentDay.required()
        }
    })
};
