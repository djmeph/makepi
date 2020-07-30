const { PromisifiedTable } = require('dynamodb-wrapper');
const _ = require('lodash');
const config = require('../../config');

class PaymentsTable extends PromisifiedTable {
    async getAllByUserId(userId) {
        const result = await super.query({
            KeyConditionExpression: '#id = :id and begins_with(#key, :key)',
            ExpressionAttributeNames: {
                '#id': 'userId',
                '#key': 'itemKey',
            },
            ExpressionAttributeValues: {
                ':id': userId,
                ':key': `${config.itemKeyPrefixes.payments}${config.itemKeyDelimiter}`,
            }
        });
        return _.get(result, 'Items', []);
    }
}

module.exports = new PaymentsTable({
    schema: require('./schema').dynamo,
    itemConstructor: require('./item')
});
