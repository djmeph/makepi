const { PromisifiedTable } = require('dynamodb-wrapper');

class PaymentsTable extends PromisifiedTable {}

module.exports = new PaymentsTable({
    schema: require('./schema').dynamo,
    itemConstructor: require('./item')
});
