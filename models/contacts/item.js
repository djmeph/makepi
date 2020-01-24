/*
 * Contacts model item class:
 * Promisified Item with History
 */
const { PromisifiedItem } = require('dynamodb-wrapper');
const config = require('../../config');
const utils = require('../../utils');


class Contacts extends PromisifiedItem {
    /**
   * @param  {} params={}
   * @param { String } params.itemKey
   * @param { String } params.userId
   */
    constructor(params = {}) {
        const attrs = { ...params };
        if (typeof params.itemKey === 'undefined') {
            // eslint-disable-next-line max-len
            attrs.itemKey = `${config.itemKeyPrefixes.contacts}${config.itemKeyDelimiter}${params.type}`;
        }
        // Attach params and schema to item
        super({
            attrs,
            schema: require('./schema').dynamo
        });
    }
}

module.exports = Contacts;
