const { PromisifiedTable } = require('dynamodb-wrapper');
const _ = require('lodash');
const config = require('../../config');

class StripePaymentMethodsTable extends PromisifiedTable {
    async getAll(userId) {
        const result = await super.query({
            TableName: config.tableNames.users,
            KeyConditionExpression: '#id = :id and begins_with(#itemKey, :itemKey)',
            ExpressionAttributeValues: {
                ':id': userId,
                ':itemKey': config.itemKeyPrefixes.stripePaymentMethods
            },
            ExpressionAttributeNames: {
                '#id': 'userId',
                '#itemKey': 'itemKey'
            }
        });
        return _.get(result, 'Items', []);
    }
}

module.exports = new StripePaymentMethodsTable({
    schema: require('./schema').dynamo,
    itemConstructor: require('./item')
});
