const _ = require('lodash');
const { PromisifiedTable } = require('dynamodb-wrapper');
const config = require('../../config');

class SubscriptionsTable extends PromisifiedTable {
  async getLatest(userId) {
    const result = await super.get({
      userId,
      itemKey: `${config.itemKeyPrefixes.subscriptions}_latest`
    });
    return result || null;
  }

  async getAll(userId) {
    let result = await super.query({
      KeyConditionExpression: 'userId = :TOKEN1 and begins_with(itemKey, :TOKEN2)',
      ExpressionAttributeValues: {
        ':TOKEN1': userId,
        ':TOKEN2': `${config.itemKeyPrefixes.subscriptions}_v`
      }
    });
    result = _.sortBy(result.Items, (n) => n.get('versionNumber'));
    result = _.reverse(result);
    return result;
  }

  async get({ userId, versionNumber }) {
    const result = await super.get({
      userId,
      itemKey: `${config.itemKeyPrefixes.subscriptions}_v${versionNumber}`
    });
    return result.Item;
  }
}

module.exports = new SubscriptionsTable({
  schema: require('./schema').dynamo,
  itemConstructor: require('./item')
});
