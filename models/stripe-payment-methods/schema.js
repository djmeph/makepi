const DB = require('dynamodb-wrapper');
const config = require('../../config');
const modelConfig = require('./config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const userId = joi.string()
    .description('User ID');

const itemKey = joi.string()
    .description('Stripe Payment Method Key');

const stripePaymentMethodId = joi.string()
    .description('Unique ID for Stripe Payment Method Item');

const createdAt = joi.date();

const publicToken = joi.string();

const source = joi
    .object()
    .description('Stripe source data');

const type = joi.number().allow(Object.values(modelConfig.types));

const sourceOutput = joi.object({
    brand: joi.string().optional(),
    last4: joi.string().optional(),
    funding: joi.string().optional(),
    bank_name: joi.string().optional(),
});

const verified = joi.boolean();

const output = joi.object({
    itemKey,
    createdAt,
    type,
    source: sourceOutput,
    stripePaymentMethodId,
    verified,
});

module.exports = {
    elements: {
        userId,
        itemKey,
        source,
        verified
    },
    post: {
        body: joi.object({
            publicToken: publicToken.required()
        }),
        response: output
    },
    verify: {
        params: joi.object({
            stripePaymentMethodId: stripePaymentMethodId.required()
        }),
        body: joi.object({
            amounts: joi.array()
                .items(joi.number())
                .min(2)
                .max(2)
                .required()
        })
    },
    getAll: {
        response: joi.array().items(output)
    },
    get: {
        params: joi.object({
            key: stripePaymentMethodId.required(),
        }),
        response: output
    },
    admin: {
        get: {
            params: joi.object({
                userId: userId.required(),
                key: stripePaymentMethodId.required(),
            })
        },
        getUser: {
            params: joi.object({
                userId: userId.required()
            })
        },
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
            stripePaymentMethodId: stripePaymentMethodId.required(),
            type: type.required(),
            source: source.required(),
            verified: verified.required(),
        }
    })
};
