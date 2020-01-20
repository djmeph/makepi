const DB = require('dynamodb-wrapper');
const config = require('../../config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const userId = joi.string()
    .description('User ID');

const itemKey = joi.string()
    .description('Schedules Key');

module.exports = {
    elements: {
        userId,
        itemKey,
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
        }
    })
};
