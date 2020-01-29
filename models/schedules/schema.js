const DB = require('dynamodb-wrapper');
const config = require('../../config');
const modelConfig = require('./config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const userId = joi.string()
    .description('User ID');

const itemKey = joi.string()
    .description('Schedules Key');

const scheduleId = joi.string()
    .description('Schedule item unique identifier');

const versionNumber = joi.number()
    .description('Historic version number');

const paymentDate = joi.string().isoDate()
    .description('Scheduled Payment Date');

const increments = joi.number().allow(Object.values(config.payments.increments))
    .description('Increments applied in payment');

const amount = joi.number()
    .description('Amount at increment applied in payment');

const status = joi.number().allow(Object.values(modelConfig.statuses))
    .description('Scheduled Payment Status');

const payments = joi.array().items(joi.object({
    paymentId: joi.string(),
    amount: joi.number(),
})).description('Payments applied to this schedule item');

const total = joi.number()
    .description('Schedule item total payment');

const balance = joi.number()
    .description('Schedule item payment balance');

module.exports = {
    elements: {
        userId,
        itemKey,
        scheduleId,
        versionNumber,
        paymentDate,
        increments,
        amount,
        status,
        payments,
        total,
        balance,
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
            versionNumber: versionNumber.required(),
            paymentDate: paymentDate.required(),
            increments: paymentDate.required(),
            amount: amount.required(),
            status: status.required(),
            payments: payments.required(),
            total: total.required(),
            balance: balance.required(),
        }
    })
};
