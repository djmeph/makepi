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

const paymentId = joi.string()
    .description('Payment ID');

const paymentMethodKey = joi.object({
    userId,
    itemKey
}).description('Universal Payment Method Key');

const amount = joi.number()
    .description('Payment Amount');

const status = joi.number().allow(Object.values(modelConfig.statuses))
    .description('Payment Status');

const statusHistory = historySchema;

const metadata = joi.object();

module.exports = {
    elements: {
        userId,
        itemKey,
        paymentId,
        paymentMethodKey,
        amount,
        status,
        metadata,
        statusHistory
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
            paymentId: paymentId.required(),
            paymentMethodKey: paymentMethodKey.required(),
            amount: amount.required(),
            status: status.required(),
            statusHistory,
            metadata: metadata.optional(),
        }
    })
};
