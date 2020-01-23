const DB = require('dynamodb-wrapper');
const config = require('../../config');
const modelConfig = require('./config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const userId = joi.string()
    .description('User ID');

const itemKey = joi.string()
    .description('contacts Key');

const contactId = joi.string()
    .description('Contact ID');

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

const type = joi.number().allow([Object.values(modelConfig.types)])
    .description('Contact Type');

module.exports = {
    elements: {
        userId,
        itemKey,
        contactId,
        firstName,
        middleName,
        lastName,
        email,
        phone,
        type,
    },
    user: {
        post: {
            body: {
                firstName: firstName.optional(),
                middleName: middleName.optional(),
                lastName: lastName.optional(),
                email: email.optional(),
                phone: phone.optional(),
                type: type.required(),
            }
        },
        params: {
            contactId: contactId.required()
        },
        response: {
            firstName: firstName.optional(),
            middleName: middleName.optional(),
            lastName: lastName.optional(),
            email: email.optional(),
            phone: phone.optional(),
            type: type.required(),
        }
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
            contactId: itemKey.required(),
            firstName: firstName.optional(),
            middleName: middleName.optional(),
            lastName: lastName.optional(),
            email: email.optional(),
            phone: phone.optional(),
            type: type.required(),
        }
    })
};
