const DB = require('dynamodb-wrapper');
const config = require('../../config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const id = joi.string()
  .description('Settings ID');

const key = joi.string()
  .description('Settings Key');

const value = joi.string()
  .description('Setting Value');

const label = joi.string()
  .description('Setting label');

const type = joi.string()
  .allow([
    'string',
    'number',
    'boolean',
    'json',
    'base64'
  ])
  .description('Setting type');

module.exports = {
  elements: {
    id,
    key,
    value,
    label,
    type
  },
  post: {
    body: joi.object({
      id: id.required(),
      value: value.optional()
    })
  },
  get: {
    params: joi.object({
      id: id.required()
    })
  },
  dynamo: new Schema({
    tableName: config.tableNames.settings,
    key: {
      hash: 'id',
      range: 'key'
    },
    timestamps: true,
    tableDefinition: require('./tableDefinition'),
    schema: {
      id: id.required(),
      key: key.required(),
      value: value.optional(),
      type: value.required(),
      label: label.required()
    }
  })
};
