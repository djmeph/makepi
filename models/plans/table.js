const { PromisifiedTable } = require('dynamodb-wrapper');
const config = require('../../config');

class PlansTable extends PromisifiedTable {
  async get(planId) { // Query by ID
    const result = await super.get({
      planId,
      key: config.keyPrefixes.plans
    });
    return result;
  }
}

module.exports = new PlansTable({
  schema: require('./schema').dynamo,
  itemConstructor: require('./item')
});
