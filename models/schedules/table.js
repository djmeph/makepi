const { PromisifiedTable } = require('dynamodb-wrapper');

class SchedulesTable extends PromisifiedTable {}

module.exports = new SchedulesTable({
    schema: require('./schema').dynamo,
    itemConstructor: require('./item')
});
