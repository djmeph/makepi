const _ = require('lodash');
const { PromisifiedTable } = require('dynamodb-wrapper');
const config = require('../../config');

class PlansTable extends PromisifiedTable {
    get(key) {
        return super.get({
            planId: key.planId,
            itemKey: `${config.itemKeyPrefixes.plans}_v${key.versionNumber}`
        });
    }

    async getLatest() {
        let result = [];
        let response;
        let exclusiveStartKey;
        do {
            response = await super.scan({
                FilterExpression: 'itemKey = :TOKEN1',
                ExpressionAttributeValues: {
                    ':TOKEN1': `${config.itemKeyPrefixes.plans}_latest`
                },
                ExclusiveStartKey: exclusiveStartKey,
            });
            result = [...result, ..._.get(response, 'Items', [])];
            exclusiveStartKey = response.LastEvaluatedKey;
        } while (exclusiveStartKey)
        return _.get(result, 'Items', []);
    }
}

module.exports = new PlansTable({
    schema: require('./schema').dynamo,
    itemConstructor: require('./item')
});
