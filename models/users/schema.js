const DB = require('dynamodb-wrapper');
const config = require('../../config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const id = joi.string()
  .description('User ID');
const key = joi.string()
  .description('Table key');

const username = joi.string();
const password = joi.string();
const remember = joi.boolean();
const token = joi.string();

module.exports = {
  elements: {
    username,
    password,
    token,
    remember
  },
  register: {
    body: joi.object({
      username: username.required(),
      password: password.required()
    })
  },
  login: {
    body: joi.object({
      username: username.required(),
      password: password.required(),
      remember: remember.required()
    })
  },
  dynamo: new Schema({
    tableName: config.tableNames.users,
    key: {
      hash: 'id',
      range: 'key'
    },
    timestamps: true,
    tableDefinition: require('./tableDefinition'),
    schema: {
      id: id.required(),
      key: key.required(),
      username: username.required(),
      password: password.optional(),
      passwordHash: password.optional()
    }
  })
};
