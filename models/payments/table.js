const { PromisifiedTable } = require('dynamodb-wrapper');
const _ = require('lodash');
const config = require('../../config');

class PaymentsTable extends PromisifiedTable {
    async getAllByUserId(userId) {
        let result = [];
        let response;
        let exclusiveStartKey
        do {
            response = await super.query({
                KeyConditionExpression: '#id = :id and begins_with(#key, :key)',
                ExpressionAttributeNames: {
                    '#id': 'userId',
                    '#key': 'itemKey',
                },
                ExpressionAttributeValues: {
                    ':id': userId,
                    ':key': `${config.itemKeyPrefixes.payments}${config.itemKeyDelimiter}`,
                },
                ExclusiveStartKey: exclusiveStartKey
            });
            result = [...result, ..._.get(response, 'Items', [])];
            exclusiveStartKey = response.LastEvaluatedKey;
        } while (exclusiveStartKey)
        result = _.sortBy(result, (n) => n.get('createdAt'));
        return result;
    }
}

module.exports = new PaymentsTable({
    schema: require('./schema').dynamo,
    itemConstructor: require('./item')
});
