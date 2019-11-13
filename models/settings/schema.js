const DB = require('dynamodb-wrapper');
const config = require('../../config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const settingsId = joi.string()
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
    settingsId,
    key,
    value,
    label,
    type
  },
  post: {
    body: joi.object({
      settingsId: settingsId.required(),
      value: value.optional()
    })
  },
  get: {
    params: joi.object({
      settingsId: settingsId.required()
    })
  },
  dynamo: new Schema({
    tableName: config.tableNames.settings,
    key: {
      hash: 'settingsId',
      range: 'key'
    },
    timestamps: true,
    tableDefinition: require('./tableDefinition'),
    schema: {
      settingsId: settingsId.required(),
      key: key.required(),
      value: value.optional(),
      type: value.required(),
      label: label.required()
    }
  })
};
