const DB = require('dynamodb-wrapper');
const config = require('../../config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const id = joi.string()
  .description('Settings ID');

const key = joi.string()
  .description('Settings Key');

const source = joi
  .object({
    id: joi.string().required(),
    brand: joi.string().required(),
    last4: joi.string().required(),
    funding: joi.string().required()
  })
  .description('Stripe source data');

module.exports = {
  elements: {
    id,
    key,
    source
  },
  post: {
    body: joi.object({
      source: source.required()
    })
  },
  dynamo: new Schema({
    tableName: config.tableNames.users,
    key: {
      hash: 'id',
      range: 'key'
    },
    timestamps: true,
    schema: {
      id: id.required(),
      key: key.required(),
      source: source.required()
    }
  })
};
