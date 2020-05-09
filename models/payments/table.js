const { PromisifiedTable } = require('dynamodb-wrapper');
const config = require('../../config');

class PaymentsTable extends PromisifiedTable {
    async getAllByUserId(userId) {
        const { Items } = await super.query({
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
        return Items;
    }
}

module.exports = new PaymentsTable({
    schema: require('./schema').dynamo,
    itemConstructor: require('./item')
});
