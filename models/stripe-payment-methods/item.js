/*
 * Stripe Credit Source model item class:
 * Promisified Item with History
 */
const { PromisifiedItem } = require('dynamodb-wrapper');
const _ = require('lodash');
const config = require('../../config');
const modelConfig = require('./config');
const utils = require('../../utils');
const { stripe } = require('../../services');


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

    async charge({ amount, description }) {
        const userId = this.get('userId');
        const source = this.get('source');
        const metadata = await stripe.charges.create({
            amount: Math.floor(amount * 100),
            currency: 'usd',
            description,
            customer: userId,
            source: source.id
        });
        return { metadata, amount: _.round(metadata.amount / 100, 2) };
    }

    get verified() {
        return this.get('verified', false);
    }
}

module.exports = StripePaymentMethods;
