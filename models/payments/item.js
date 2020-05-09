/*
 * Payments model item class:
 * Promisified Item with History
 */
const { ItemWithHistory } = require('dynamodb-wrapper');
const config = require('../../config');
const modelConfig = require('./config');
const utils = require('../../utils');


class Payments extends ItemWithHistory {
    /**
   * @param  {} params={}
   * @param { String } params.itemKey
   * @param { String } params.userId
   * @param { String } params.paymentId
   */
    constructor(params = {}) {
        const attrs = { ...params };
        if (typeof params.itemKey === 'undefined') {
            const uuid = utils.uuid();
            // eslint-disable-next-line max-len
            attrs.itemKey = `${config.itemKeyPrefixes.payments}${config.itemKeyDelimiter}${uuid}`;
            attrs.paymentId = uuid;
        }
        // Attach params and schema to item
        super({
            attrs,
            schema: require('./schema').dynamo
        });
    }

    shouldAddHistory(field) {
        return field === 'status';
    }

    statusText() {
        switch (this.get('status')) {
        case modelConfig.statuses.pending:
            return 'pending';
        case modelConfig.statuses.complete:
            return 'complete';
        case modelConfig.statuses.failed:
            return 'failed';
        default:
            return null;
        }
    }
}

module.exports = Payments;
