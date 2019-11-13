/*
 * Plans model item class:
 * Promisified Item with History
 */
const { PromisifiedItem } = require('dynamodb-wrapper');
const config = require('../../config');
const utils = require('../../utils');

class Plans extends PromisifiedItem {
  /**
   * @param  {} params={}
   * @param { String } params.key
   * @param { String } params.planId
   */
  constructor(params = {}) {
    const attrs = { ...params };
    // If key not provided use default
    if (typeof params.key === 'undefined') {
      attrs.key = config.keyPrefixes.plans;
    }
    // If id not provided generate new UUID
    if (typeof params.planId === 'undefined') {
      attrs.planId = utils.uuid();
    }
    attrs.key = config.keyPrefixes.plans;
    // Attach params and schema to item
    super({
      attrs,
      schema: require('./schema').dynamo
    });
  }
}

module.exports = Plans;
