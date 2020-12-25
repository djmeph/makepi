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
            FilterExpression: '#date <= :date and begins_with(#key, :key)',
            KeyConditionExpression: '#status = :status',
            ExpressionAttributeNames: {
                '#key': 'itemKey',
                '#status': 'status',
                '#date': 'paymentDate',
            },
            ExpressionAttributeValues: {
                ':status': modelConfig.statuses.unpaid,
                ':date': paymentDate,
                ':key': `${config.itemKeyPrefixes.schedules}${config.itemKeyDelimiter}`,
            }
        });
        return _.get(results, 'Items', []);
    }

    async getAllUnpaidAfterDate(paymentDate = moment.tz(config.TIMEZONE).format()) {
        const results = await super.query({
            IndexName: 'status-index',
            FilterExpression: '#date >= :date and begins_with(#key, :key)',
            KeyConditionExpression: '#status = :status',
            ExpressionAttributeNames: {
                '#key': 'itemKey',
                '#status': 'status',
                '#date': 'paymentDate',
            },
            ExpressionAttributeValues: {
                ':status': modelConfig.statuses.unpaid,
                ':date': paymentDate,
                ':key': `${config.itemKeyPrefixes.schedules}${config.itemKeyDelimiter}`,
            }
        });
        return _.get(results, 'Items', []);
    }

    async getByUserIdAndStatus({ userId, status }) {
        const results = await super.query({
            IndexName: 'status-index',
            FilterExpression: '#id = :id and begins_with(#key, :key)',
            KeyConditionExpression: '#s = :s',
            ExpressionAttributeNames: {
                '#key': 'itemKey',
                '#id': 'userId',
                '#s': 'status',
            },
            ExpressionAttributeValues: {
                ':id': userId,
                ':s': status,
                ':key': `${config.itemKeyPrefixes.schedules}${config.itemKeyDelimiter}`,
            }
        });
        return _.get(results, 'Items', []);
    }

    async getAllByStatus({ status }) {
        const results = await super.query({
            IndexName: 'status-index',
            KeyConditionExpression: '#s = :s',
            FilterExpression: 'begins_with(#key, :key)',
            ExpressionAttributeNames: {
                '#s': 'status',
                '#key': 'itemKey',
            },
            ExpressionAttributeValues: {
                ':s': status,
                ':key': `${config.itemKeyPrefixes.schedules}${config.itemKeyDelimiter}`,
            }
        });
        return _.get(results, 'Items', []);
    }

    async getAllByUserId(userId) {
        let result = [];
        let response;
        let exclusiveStartKey;
        do {
            response = await super.query({
                KeyConditionExpression: '#id = :id and begins_with(#key, :key)',
                ExpressionAttributeNames: {
                    '#id': 'userId',
                    '#key': 'itemKey',
                },
                ExpressionAttributeValues: {
                    ':id': userId,
                    ':key': `${config.itemKeyPrefixes.schedules}${config.itemKeyDelimiter}`,
                },
                ExclusiveStartKey: exclusiveStartKey,
            });
            result = [...result, ..._.get(response, 'Items', [])];
            exclusiveStartKey = response.LastEvaluatedKey;
        } while (exclusiveStartKey)
        result = _.sortBy(result, (n) => n.get('paymentDate'));
        return result;
    }
}

module.exports = new SchedulesTable({
    schema: require('./schema').dynamo,
    itemConstructor: require('./item')
});
