const DB = require('dynamodb-wrapper');
const config = require('../../config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const id = joi.string()
  .description('Settings ID');

const key = joi.string()
  .description('Settings Key');

const createdAt = joi.date();

const publicToken = joi.string();

const source = joi
  .object()
  .description('Stripe source data');

const object = joi.string().allow(['card', 'bank_account']);

const sourceOutput = joi.object({
  object: object.required(),
  brand: joi.string().optional(),
  last4: joi.string().required(),
  funding: joi.string().optional(),
  bank_name: joi.string().optional(),
});

const output = joi.object({
  key,
  createdAt,
  source: sourceOutput
});

module.exports = {
  elements: {
    id,
    key,
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
      hash: 'id',
      range: 'key'
    },
    timestamps: true,
    schema: {
      id: id.required(),
      key: key.required(),
      object: object.required(),
      source: source.required(),
    }
  })
};
