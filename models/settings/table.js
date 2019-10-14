const { PromisifiedTable } = require('dynamodb-wrapper');
const config = require('../../config');

class SettingsTable extends PromisifiedTable {
  async get(id) { // Query by ID
    const result = await super.get({
      id,
      key: config.keyPrefixes.settings
    });
    return result;
  }
}

module.exports = new SettingsTable({
  schema: require('./schema').dynamo,
  itemConstructor: require('./item')
});
