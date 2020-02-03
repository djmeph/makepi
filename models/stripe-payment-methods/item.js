/*
 * Stripe Credit Source model item class:
 * Promisified Item with History
 */
const { PromisifiedItem } = require('dynamodb-wrapper');
const _ = require('lodash');
const config = require('../../config');
const modelConfig = require('./config');
const utils = require('../../utils');


class StripePaymentMethods extends PromisifiedItem {
    /**
   * @param  {} params={}
   * @param { String } params.itemKey
   * @param { String } params.userId
   */
    constructor(params = {}) {
        const attrs = { ...params };
        // If itemKey not provided generate new UUID
        if (typeof params.itemKey === 'undefined') {
            const uuid = utils.uuid();
            // eslint-disable-next-line max-len
            attrs.itemKey = `${config.itemKeyPrefixes.stripePaymentMethods}${config.itemKeyDelimiter}${uuid}`;
            attrs.stripePaymentMethodId = uuid;
        }
        if (typeof params.type === 'undefined') {
            attrs.type = modelConfig.types[_.get(params, 'source.object')];
        }
        // Attach params and schema to item
        super({
            attrs,
            schema: require('./schema').dynamo
        });
    }
}

module.exports = StripePaymentMethods;
