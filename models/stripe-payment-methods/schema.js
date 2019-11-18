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

const output = joi.object({
  itemKey,
  createdAt,
  type,
  source: sourceOutput,
  stripePaymentMethodId
});

module.exports = {
  elements: {
    userId,
    itemKey,
    source
  },
  post: {
    body: joi.object({
      publicToken: publicToken.required()
    }),
    response: output
  },
  getAll: {
    response: joi.array().items(output)
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
      stripePaymentMethodId: stripePaymentMethodId.required(),
      type: type.required(),
      source: source.required()
    }
  })
};
