const DB = require('dynamodb-wrapper');
const config = require('../../config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const userId = joi.string()
  .description('User ID');

const key = joi.string()
  .description('Table key');

const username = joi.string()
  .description('Username');

const password = joi.string()
  .min(8)
  .max(255)
  .regex(/[a-zA-Z]/)
  .regex(/[0-9]/)
  .description('New password in plain-text');

const passwordHash = joi.string()
  .description('Salted and Hashed Password');

const remember = joi.boolean()
  .description('Conditional: expiration set on token');

const token = joi.string()
  .description('JWT Auth token');

const access = joi.array()
  .items(joi.number().allow(Object.values(config.access.level)))
  .description('Access levels granted to user');

module.exports = {
  elements: {
    username,
    password,
    token,
    remember,
    access
  },
  register: {
    body: joi.object({
      username: username.required(),
      password
    })
  },
  login: {
    body: joi.object({
      username: username.required(),
      password: joi.string().required(),
      remember: remember.required()
    })
  },
  dynamo: new Schema({
    tableName: config.tableNames.users,
    key: {
      hash: 'userId',
      range: 'key'
    },
    timestamps: true,
    tableDefinition: require('./tableDefinition'),
    schema: {
      userId: userId.required(),
      key: key.required(),
      username: username.required(),
      passwordHash: passwordHash.optional(),
      access: access.optional()
    }
  })
};
