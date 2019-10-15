const { PromisifiedTable } = require('dynamodb-wrapper');
const _ = require('lodash');
const config = require('../../config');
const utils = require('../../utils');

class StripeCreditsTable extends PromisifiedTable {
  async getAll(id) {
    const result = await super.query({
      TableName: config.tableNames.users,
      KeyConditionExpression: '#id = :id and begins_with(#key, :key)',
      ExpressionAttributeValues: {
        ':id': id,
        ':key': config.keyPrefixes.stripeCredits
      },
      ExpressionAttributeNames: {
        '#id': 'id',
        '#key': 'key'
      }
    });
    return _.get(result, 'Items', []).map((n) => {
      n.set('key', utils.stripKeyPrefix(n.get('key')));
      return n;
    });
  }
}

module.exports = new StripeCreditsTable({
  schema: require('./schema').dynamo,
  itemConstructor: require('./item')
});
