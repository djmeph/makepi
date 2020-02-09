const DB = require('dynamodb-wrapper');
const config = require('../../config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const planId = joi.string();
const itemKey = joi.string();

const name = joi.string();
const amount = joi.number();
const increments = joi.number().allow(Object.values(config.payments.increments));
const price = joi.number();
const versionNumber = joi.number();
const sort = joi.number();

const access = joi.array()
    .items(joi.number().allow(Object.values(config.access.level)))
    .description('Access levels granted to user');

module.exports = {
    elements: {
        planId,
        itemKey,
        name,
        amount,
        increments,
        price,
        versionNumber,
        sort,
        access
    },
    post: {
        body: joi.object({
            planId: planId.required(),
            name: name.required(),
            amount: amount.required(),
            increments: increments.required(),
            price: price.required(),
            sort: sort.required(),
            access: access.required(),
        })
    },
    get: {
        params: joi.object({
            planId: planId.required(),
            versionNumber: versionNumber.required()
        })
    },
    dynamo: new Schema({
        tableName: config.tableNames.plans,
        key: {
            hash: 'planId',
            range: 'itemKey'
        },
        timestamps: true,
        tableDefinition: require('./tableDefinition'),
        schema: {
            planId: planId.required(),
            itemKey: itemKey.required(),
            versionNumber: versionNumber.required(),
            name: name.required(),
            amount: amount.required(),
            increments: increments.required(),
            price: price.required(),
            sort: sort.required(),
            access: access.required(),
        }
    })
};
