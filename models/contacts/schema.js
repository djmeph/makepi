const DB = require('dynamodb-wrapper');
const config = require('../../config');
const modelConfig = require('./config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const userId = joi.string()
    .description('User ID');

const itemKey = joi.string()
    .description('contacts Key');

const firstName = joi.string()
    .description('First Name');
const lastName = joi.string()
    .description('Last Name');
const middleName = joi.string()
    .description('Middle Name');
const email = joi.string().email()
    .description('Email Address');
const phone = joi.string()
    .description('Phone Number');

const relation = joi.string()
    .description('Relation');

const type = joi.number().allow([Object.values(modelConfig.types)])
    .description('Contact Type');

module.exports = {
    elements: {
        userId,
        itemKey,
        firstName,
        middleName,
        lastName,
        email,
        phone,
        type,
        relation,
    },
    user: {
        post: {
            body: joi.object({
                firstName: firstName.optional(),
                middleName: middleName.optional(),
                lastName: lastName.optional(),
                email: email.optional(),
                phone: phone.optional(),
                relation: relation.optional()
            })
        },
        params: joi.object({
            type: type.required()
        }),
        response: joi.object({
            firstName,
            middleName,
            lastName,
            relation,
            email,
            phone,
            type,
            message: joi.string().optional(),
        })
    },
    admin: {
        post: {
            body: joi.object({
                firstName: firstName.optional(),
                middleName: middleName.optional(),
                lastName: lastName.optional(),
                email: email.optional(),
                phone: phone.optional(),
                relation: relation.optional()
            })
        },
        params: joi.object({
            userId: userId.required(),
            type: type.required()
        }),
        response: joi.object({
            userId,
            firstName,
            middleName,
            lastName,
            relation,
            email,
            phone,
            type,
            message: joi.string().optional(),
        })
    },
    dynamo: new Schema({
        tableName: config.tableNames.users,
        key: {
            hash: 'userId',
            range: 'itemKey'
        },
        timestamps: true,
        schema: {
            userId: userId.required(),
            itemKey: itemKey.required(),
            firstName: firstName.optional(),
            middleName: middleName.optional(),
            lastName: lastName.optional(),
            email: email.optional(),
            phone: phone.optional(),
            relation: relation.optional(),
            type: type.required(),
        }
    })
};
