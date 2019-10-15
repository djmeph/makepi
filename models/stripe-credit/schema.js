const DB = require('dynamodb-wrapper');
const config = require('../../config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const id = joi.string()
  .description('Settings ID');

const key = joi.string()
  .description('Settings Key');

const publicToken = joi.string();

const source = joi
  .object({
    id: joi.string().required(),
    object: joi.string().required(),
    brand: joi.string().required(),
    last4: joi.string().required(),
    funding: joi.string().required(),
    address_city: joi.any().optional(),
    address_country: joi.any().optional(),
    address_line1: joi.any().optional(),
    address_line1_check: joi.any().optional(),
    address_line2: joi.any().optional(),
    address_state: joi.any().optional(),
    address_zip: joi.any().optional(),
    address_zip_check: joi.any().optional(),
    country: joi.any().optional(),
    customer: joi.any().optional(),
    cvc_check: joi.any().optional(),
    dynamic_last4: joi.any().optional(),
    exp_month: joi.any().optional(),
    exp_year: joi.any().optional(),
    fingerprint: joi.any().optional(),
    metadata: joi.any().optional(),
    name: joi.any().optional(),
    tokenization_method: joi.any().optional(),
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
      publicToken: publicToken.required()
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
