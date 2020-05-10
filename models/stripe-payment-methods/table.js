const { PromisifiedTable } = require('dynamodb-wrapper');
const _ = require('lodash');
const config = require('../../config');

class StripePaymentMethodsTable extends PromisifiedTable {
    async getAll(userId) {
        const result = await super.query({
            TableName: config.tableNames.users,
            KeyConditionExpression: '#id = :id and begins_with(#itemKey, :itemKey)',
            ExpressionAttributeNames: {
                '#id': 'userId',
                '#itemKey': 'itemKey'
            },
            ExpressionAttributeValues: {
                ':id': userId,
                ':itemKey': config.itemKeyPrefixes.stripePaymentMethods
            }
        });
        return _.get(result, 'Items', []);
    }

    async getByStripeSourceId(stripeSourceId) {
        const result = await super.query({
            IndexName: 'stripeSourceId-index',
            TableName: config.tableNames.users,
            KeyConditionExpression: '#id = :id',
            ExpressionAttributeNames: { '#id': 'stripeSourceId' },
            ExpressionAttributeValues: { ':id': stripeSourceId },
        });
        return _.get(result, 'Items.0', null);
    }
}

module.exports = new StripePaymentMethodsTable({
    schema: require('./schema').dynamo,
    itemConstructor: require('./item')
});
