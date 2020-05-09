/*
 * Schedules model item class:
 * Promisified Item with History
 */
const { ItemWithHistory } = require('dynamodb-wrapper');
const config = require('../../config');
const modelConfig = require('./config');
const utils = require('../../utils');

class Schedules extends ItemWithHistory {
    /**
   * @param  {} params={}
   * @param { String } params.itemKey
   * @param { String } params.userId
   * @param { String } params.scheduleId
   * @param { Number } params.versionNumber
   */
    constructor(params = {}) {
        const attrs = { ...params };
        if (typeof params.itemKey === 'undefined') {
            const uuid = utils.uuid();
            // eslint-disable-next-line max-len
            attrs.itemKey = `${config.itemKeyPrefixes.schedules}${config.itemKeyDelimiter}${uuid}`;
            attrs.scheduleId = uuid;
        }
        // Attach params and schema to item
        super({
            attrs,
            schema: require('./schema').dynamo
        });
    }

    shouldAddHistory(field) {
        return ['status', 'failure'].includes(field);
    }

    statusText() {
        switch (this.get('status')) {
        case modelConfig.statuses.unpaid:
            return 'unpaid';
        case modelConfig.statuses.paid:
            return 'paid';
        case modelConfig.statuses.late:
            return 'late';
        case modelConfig.statuses.cancelled:
            return 'cancelled';
        default:
            return null;
        }
    }
}

module.exports = Schedules;
