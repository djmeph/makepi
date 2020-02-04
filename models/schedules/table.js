const { PromisifiedTable } = require('dynamodb-wrapper');
const _ = require('lodash');
const moment = require('moment-timezone');
const config = require('../../config');
const modelConfig = require('./config');

class SchedulesTable extends PromisifiedTable {
    async getLatestByUserIdAfterDate({ userId, paymentDate = moment().toISOString() }) {
        const results = await super.query({
            FilterExpression: '#date >= :date',
            KeyConditionExpression: '#id = :id and begins_with(#key, :key)',
            ExpressionAttributeNames: {
                '#id': 'userId',
                '#key': 'itemKey',
                '#date': 'paymentDate',
            },
            ExpressionAttributeValues: {
                ':id': userId,
                ':key': `${config.itemKeyPrefixes.schedules}${config.itemKeyDelimiter}`,
                ':date': paymentDate,
            },
        });
        return _.get(results, 'Items', []);
    }

    async getLatestByUserIdBeforeDate({ userId, paymentDate = moment().toISOString() }) {
        const results = await super.query({
            FilterExpression: '#date <= :date',
            KeyConditionExpression: '#id = :id and begins_with(#key, :key)',
            ExpressionAttributeNames: {
                '#id': 'userId',
                '#key': 'itemKey',
                '#date': 'paymentDate',
            },
            ExpressionAttributeValues: {
                ':id': userId,
                ':key': `${config.itemKeyPrefixes.schedules}${config.itemKeyDelimiter}`,
                ':date': paymentDate,
            },
        });
        return _.get(results, 'Items', []);
    }

    async getAllUnpaidBeforeDate(paymentDate = moment.tz(config.TIMEZONE).format()) {
        const results = await super.query({
            IndexName: 'status-index',
            FilterExpression: '#date <= :date',
            KeyConditionExpression: '#status = :status',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#date': 'paymentDate',
            },
            ExpressionAttributeValues: {
                ':status': modelConfig.statuses.unpaid,
                ':date': paymentDate,
            }
        });
        return _.get(results, 'Items', []);
    }

    async getAllUnpaidAfterDate(paymentDate = moment.tz(config.TIMEZONE).format()) {
        const results = await super.query({
            IndexName: 'status-index',
            FilterExpression: '#date >= :date',
            KeyConditionExpression: '#status = :status',
            ExpressionAttributeNames: {
                '#status': 'status',
                '#date': 'paymentDate',
            },
            ExpressionAttributeValues: {
                ':status': modelConfig.statuses.unpaid,
                ':date': paymentDate,
            }
        });
        return _.get(results, 'Items', []);
    }

    async getByUserIdAndStatus({ userId, status }) {
        const results = await super.query({
            IndexName: 'status-index',
            FilterExpression: '#id = :id',
            KeyConditionExpression: '#s = :s',
            ExpressionAttributeNames: {
                '#id': 'userId',
                '#s': 'status',
            },
            ExpressionAttributeValues: {
                ':id': userId,
                ':s': status,
            }
        });
        return _.get(results, 'Items', []);
    }
}

module.exports = new SchedulesTable({
    schema: require('./schema').dynamo,
    itemConstructor: require('./item')
});
