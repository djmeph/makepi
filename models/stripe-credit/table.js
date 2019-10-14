const { PromisifiedTable } = require('dynamodb-wrapper');

class StripeCreditTable extends PromisifiedTable {}

module.exports = new StripeCreditTable({
  schema: require('./schema').dynamo,
  itemConstructor: require('./item')
});
