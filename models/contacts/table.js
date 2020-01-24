const { PromisifiedTable } = require('dynamodb-wrapper');
const config = require('../../config');

class ContactsTable extends PromisifiedTable {
    get({ userId, type }) {
        return super.get({
            userId,
            itemKey: `${config.itemKeyPrefixes.contacts}${config.itemKeyDelimiter}${type}`
        });
    }
}

module.exports = new ContactsTable({
    schema: require('./schema').dynamo,
    itemConstructor: require('./item')
});
