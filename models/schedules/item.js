/*
 * Schedules model item class:
 * Promisified Item with History
 */
const { PromisifiedItem } = require('dynamodb-wrapper');
const config = require('../../config');
const utils = require('../../utils');


class Schedules extends PromisifiedItem {
    /**
   * @param  {} params={}
   * @param { String } params.itemKey
   * @param { String } params.userId
   */
    constructor(params = {}) {
        const attrs = { ...params };
        if (typeof params.itemKey === 'undefined') {
            const uuid = utils.uuid();
            // eslint-disable-next-line max-len
            attrs.itemKey = `${config.itemKeyPrefixes.schedules}${config.itemKeyDelimiter}${uuid}`;
        }
        // Attach params and schema to item
        super({
            attrs,
            schema: require('./schema').dynamo
        });
    }
}

module.exports = Schedules;
