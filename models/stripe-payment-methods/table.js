const { PromisifiedTable } = require('dynamodb-wrapper');
const _ = require('lodash');
const config = require('../../config');
const utils = require('../../utils');

class StripePaymentMethodsTable extends PromisifiedTable {
  async getAll(userId) {
    const result = await super.query({
      TableName: config.tableNames.users,
      KeyConditionExpression: '#id = :id and begins_with(#key, :key)',
      ExpressionAttributeValues: {
        ':id': userId,
        ':key': config.keyPrefixes.stripePaymentMethods
      },
      ExpressionAttributeNames: {
        '#id': 'userId',
        '#key': 'key'
      }
    });
    return _.get(result, 'Items', []).map((n) => {
      n.set('key', utils.stripKeyPrefix(n.get('key')));
      return n;
    });
  }
}

module.exports = new StripePaymentMethodsTable({
  schema: require('./schema').dynamo,
  itemConstructor: require('./item')
});
