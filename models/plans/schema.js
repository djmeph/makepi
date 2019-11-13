const DB = require('dynamodb-wrapper');
const config = require('../../config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const planId = joi.string();
const key = joi.string();

module.exports = {
  elements: {},
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
      key: key.required()
    }
  })
};
