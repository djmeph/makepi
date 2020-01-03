/*
 * Settings model item class:
 * Promisified Item with History
 */
const { PromisifiedItem } = require('dynamodb-wrapper');
const config = require('../../config');

class Settings extends PromisifiedItem {
    /**
   * @param  {} params={}
   * @param { String } params.itemKey
   * @param { String } params.settingId
   */
    constructor(params = {}) {
        const attrs = { ...params };
        // If itemKey not provided use default
        if (typeof params.itemKey === 'undefined') {
            attrs.itemKey = config.itemKeyPrefixes.settings;
        }
        // Attach params and schema to item
        super({
            attrs,
            schema: require('./schema').dynamo
        });
    }
}

module.exports = Settings;
