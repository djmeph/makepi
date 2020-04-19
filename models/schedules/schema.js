const DB = require('dynamodb-wrapper');
const config = require('../../config');
const modelConfig = require('./config');
const historySchema = require('../shared/history');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const userId = joi.string()
    .description('User ID');

const itemKey = joi.string()
    .description('Schedules Key');

const scheduleId = joi.string()
    .description('Schedule item unique identifier');

const paymentDate = joi.string().isoDate()
    .description('Scheduled Payment Date');

const increments = joi.number().allow(Object.values(config.payments.increments))
    .description('Increments applied in payment');

const amount = joi.number()
    .description('Amount at increment applied in payment');

const status = joi.number().allow(Object.values(modelConfig.statuses))
    .description('Scheduled Payment Status');

const statusHistory = historySchema;

const payments = joi.array().items(joi.object({
    paymentId: joi.string(),
    amount: joi.number(),
})).description('Payments applied to this schedule item');

const total = joi.number()
    .description('Schedule item total payment');

const balance = joi.number()
    .description('Schedule item payment balance');

const failure = joi.object()
    .description('Payment failure details');

const failureHistory = historySchema;

module.exports = {
    elements: {
        userId,
        itemKey,
        scheduleId,
        paymentDate,
        increments,
        amount,
        status,
        statusHistory,
        payments,
        total,
        balance,
        failure,
        failureHistory
    },
    getStatus: {
        params: joi.object({
            status: status.required(),
        })
    },
    post: {
        params: joi.object({
            status: status.required(),
        })
    },
    admin: {
        getAllUsers: joi.object({
            params: {
                status: status.required(),
            },
        }),
        getUser: joi.object({
            params: {
                userId: userId.required(),
                status: status.required(),
            },
        }),
        post: {
            body: joi.object({
                userId: userId.required(),
                scheduleId: scheduleId.required(),
                paymentDate: paymentDate.required(),
                increments: increments.required(),
                amount: amount.required(),
                status: status.required(),
                payments: payments.required(),
                total: total.required(),
                balance: balance.required(),
            })
        },
        put: {
            params: joi.object({
                userId: userId.required(),
                scheduleId: scheduleId.required(),
            }),
            body: joi.object({
                paymentDate: paymentDate.optional(),
                increments: increments.optional(),
                amount: amount.optional(),
                status: status.optional(),
                payments: payments.optional(),
                total: total.optional(),
                balance: balance.optional(),
            })
        }
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
            scheduleId: scheduleId.required(),
            paymentDate: paymentDate.required(),
            increments: increments.required(),
            amount: amount.required(),
            status: status.required(),
            statusHistory,
            payments: payments.required(),
            total: total.required(),
            balance: balance.required(),
            failure: failure.optional(),
            failureHistory,
        }
    })
};
