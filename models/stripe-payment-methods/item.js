/*
 * Stripe Credit Source model item class:
 * Promisified Item with History
 */
const { PromisifiedItem } = require('dynamodb-wrapper');
const _ = require('lodash');
const config = require('../../config');
const modelConfig = require('./config');


class StripePaymentMethods extends PromisifiedItem {
  /**
   * @param  {} params={}
   * @param { String } params.key
   * @param { String } params.userId
   */
  constructor(params = {}) {
    const attrs = { ...params };
    // If key not provided generate new UUID
    if (typeof params.key === 'undefined') {
      const stripePaymentMethodId = _.get(params, 'source.id');
      const type = modelConfig.types[_.get(params, 'source.object')];
      if (!stripePaymentMethodId) throw new Error('Payment method ID not found');
      attrs.key = `${config.keyPrefixes.stripePaymentMethods}${config.keyDelimiter}${stripePaymentMethodId}`;
      attrs.stripePaymentMethodId = stripePaymentMethodId;
      attrs.type = type;
    }
    // Attach params and schema to item
    super({
      attrs,
      schema: require('./schema').dynamo
    });
  }
}

module.exports = StripePaymentMethods;
