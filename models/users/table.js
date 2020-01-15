const { PromisifiedTable } = require('dynamodb-wrapper');
const _ = require('lodash');
const config = require('../../config');
const modelConfig = require('./config');

class UsersTable extends PromisifiedTable {
    async get(userId) { // Query by ID
        const result = await super.get({
            userId,
            itemKey: config.itemKeyPrefixes.users
        });
        return result;
    }

    async getByUsername(username) { // Query by username
        const result = await super.query({
            IndexName: 'username-index',
            TableName: config.tableNames.users,
            KeyConditionExpression: 'username = :username',
            ExpressionAttributeValues: {
                ':username': username.toLowerCase()
            },
            Limit: 1
        });
        return result.Count ? result.Items[0] : null;
    }

    async getAll(exclusiveStartKey) {
        const params = {
            IndexName: 'active-index',
            KeyConditionExpression: '#a = :a',
            ExpressionAttributeNames: { '#a': 'active' },
            ExpressionAttributeValues: { ':a': modelConfig.active.TRUE },
            Limit: 30
        };
        if (exclusiveStartKey) params.ExclusiveStartKey = exclusiveStartKey;
        const result = await super.query(params);
        return result;
    }

    async search(key) {
        if (!key) return [];
        const params = {
            IndexName: 'active-index',
            KeyConditionExpression: '#a = :a',
            FilterExpression: 'contains(#key, :val)',
            ExpressionAttributeNames: {
                '#a': 'active',
                '#key': 'username',
            },
            ExpressionAttributeValues: {
                ':a': modelConfig.active.TRUE,
                ':val': key.toLowerCase()
            },
            Limit: 300
        };
        let result;
        let results = [];
        result = await super.query(params);
        results = result.Items;
        while (result.LastEvaluatedKey) {
            params.ExclusiveStartKey = result.LastEvaluatedKey;
            result = await super.query(params);
            results = _.concat(results, result.Items);
        }
        return results;
    }
}

module.exports = new UsersTable({
    schema: require('./schema').dynamo,
    itemConstructor: require('./item')
});
