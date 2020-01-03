const DB = require('dynamodb-wrapper');
const config = require('../../config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const userId = joi.string()
    .description('User ID');

const itemKey = joi.string()
    .description('Table itemKey');

const username = joi.string()
    .email()
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

const loginAttempts = joi.number()
    .description('Counter for invalid login attempts');

const lockUntil = joi.date().iso()
    .description('Expiration timestamp for account lock');

const recoverCode = joi.string()
    .description('Code to unlock account');

module.exports = {
    elements: {
        username,
        password,
        token,
        remember,
        access,
        loginAttempts,
        lockUntil,
        recoverCode
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
            range: 'itemKey'
        },
        timestamps: true,
        tableDefinition: require('./tableDefinition'),
        schema: {
            userId: userId.required(),
            itemKey: itemKey.required(),
            username: username.required(),
            passwordHash: passwordHash.optional(),
            access: access.optional(),
            loginAttempts: loginAttempts.optional(),
            lockUntil: lockUntil.optional(),
            recoverCode: recoverCode.optional(),
        }
    })
};
