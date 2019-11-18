/*
 * Plans model item class:
 * Promisified Item with History
 */
const { ItemWithStream } = require('dynamodb-wrapper');
const config = require('../../config');
const utils = require('../../utils');

class Plans extends ItemWithStream {
  /**
   * @param  {} params={}
   * @param { String } params.itemKey
   * @param { String } params.planId
   */
  constructor(params = {}) {
    const attrs = { ...params };
    // If itemKey not provided use default
    if (typeof params.itemKey === 'undefined') {
      attrs.itemKey = config.itemKeyPrefixes.plans;
    }
    // If id not provided generate new UUID
    if (typeof params.planId === 'undefined') {
      attrs.planId = utils.uuid();
    }
    attrs.itemKey = config.itemKeyPrefixes.plans;
    // Attach params and schema to item
    super({
      attrs,
      schema: require('./schema').dynamo
    });
  }
}

module.exports = Plans;
