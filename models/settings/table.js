const { PromisifiedTable } = require('dynamodb-wrapper');
const config = require('../../config');
const modelConfig = require('./config');

class SettingsTable extends PromisifiedTable {
  async get(settingId) { // Query by ID
    const result = await super.get({
      settingId,
      itemKey: config.itemKeyPrefixes.settings
    });
    if (!result) throw new Error('Setting not found');
    return this._processSettingResponse(result);
  }

  _processSettingResponse(payload) {
    const setting = payload.get();
    switch (setting.type) {
    case modelConfig.types.number:
      setting.value = Number(setting.value);
      break;
    case modelConfig.types.boolean:
      setting.value = !!setting.value;
      break;
    case modelConfig.types.json:
      setting.value = JSON.stringify(setting.value);
      break;
    case modelConfig.types.base64:
      setting.value = Buffer.from(setting.value, 'base64');
      break;
    case modelConfig.types.string:
      setting.value = `${setting.value}`;
      break;
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
