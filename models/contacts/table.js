const { PromisifiedTable } = require('dynamodb-wrapper');

class ContactsTable extends PromisifiedTable {}

module.exports = new ContactsTable({
    schema: require('./schema').dynamo,
    itemConstructor: require('./item')
});
