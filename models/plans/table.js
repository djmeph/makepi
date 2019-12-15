const _ = require('lodash');
const { PromisifiedTable } = require('dynamodb-wrapper');
const config = require('../../config');

class PlansTable extends PromisifiedTable {
    async getLatest() {
        const result = await super.scan({
            FilterExpression: 'itemKey = :TOKEN1',
            ExpressionAttributeValues: {
                ':TOKEN1': `${config.itemKeyPrefixes.plans}_latest`
            }
        });
        if (_.get(result, 'Count')) return result.Items;
        return [];
    }
}

module.exports = new PlansTable({
    schema: require('./schema').dynamo,
    itemConstructor: require('./item')
});
