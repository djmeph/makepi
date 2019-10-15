const { PromisifiedTable } = require('dynamodb-wrapper');
const config = require('../../config');

class SettingsTable extends PromisifiedTable {
  async get(id) { // Query by ID
    const result = await super.get({
      id,
      key: config.keyPrefixes.settings
    });
    return this._processSettingResponse(result);
  }

  _processSettingResponse(payload) {
    const setting = payload.get();
    switch (setting.type) {
    case 'number':
      setting.value = Number(setting.value);
      break;
    case 'boolean':
      setting.value = !!setting.value;
      break;
    case 'json':
      setting.value = JSON.stringify(setting.value);
      break;
    case 'base64':
      setting.value = Buffer.from(setting.value, 'base64');
      break;
    case 'string':
    default:
    }
    return {
      value: setting.value,
      label: setting.label
    };
  }
}

module.exports = new SettingsTable({
  schema: require('./schema').dynamo,
  itemConstructor: require('./item')
});
