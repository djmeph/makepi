const DB = require('dynamodb-wrapper');
const config = require('../../config');
const modelConfig = require('./config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const planId = joi.string();
const key = joi.string();

const name = joi.string();
const amount = joi.number();
const increments = joi.number().allow(Object.values(modelConfig.increments));
const price = joi.number();

module.exports = {
  elements: {},
  post: {
    body: joi.object({
      planId: planId.optional(),
      name: name.required(),
      amount: amount.required(),
      increments: increments.required(),
      price: price.required()
    })
  },
  dynamo: new Schema({
    tableName: config.tableNames.plans,
    key: {
      hash: 'planId',
      range: 'key'
    },
    timestamps: true,
    tableDefinition: require('./tableDefinition'),
    schema: {
      planId: planId.required(),
      key: key.required(),
      name: name.required(),
      amount: amount.required(),
      increments: increments.required(),
      price: price.required(),
    }
  })
};
