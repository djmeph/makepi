/*
 * Subscription model item class:
 * Promisified Item with History
 */
const { ItemWithStream } = require('dynamodb-wrapper');
const config = require('../../config');

class Subscriptions extends ItemWithStream {
    /**
     * @param {} params={}
     * @param { String } params.itemKey
     * @param { String } params.userId
     */
    constructor(params = {}) {
        const attrs = { ...params };
        // If itemKey not provided use config
        if (typeof params.itemKey === 'undefined') {
            attrs.itemKey = config.itemKeyPrefixes.subscriptions;
        }
        // Attach params and schema to item
        super({
            attrs,
            schema: require('./schema').dynamo
        });
    }
}

module.exports = Subscriptions;
