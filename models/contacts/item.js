/*
 * Contacts model item class:
 * Promisified Item with History
 */
const { PromisifiedItem } = require('dynamodb-wrapper');
const _ = require('lodash');
const AWS = require('aws-sdk');
const config = require('../../config');

const documentClient = new AWS.DynamoDB.DocumentClient({
    version: config.awsConfig.apiVersions.dynamodb,
    region: config.awsConfig.region
});


class Contacts extends PromisifiedItem {
    /**
   * @param  {} params={}
   * @param { String } params.itemKey
   * @param { String } params.userId
   */
    constructor(params = {}) {
        const attrs = { ...params };
        if (typeof params.itemKey === 'undefined') {
            // eslint-disable-next-line max-len
            attrs.itemKey = `${config.itemKeyPrefixes.contacts}${config.itemKeyDelimiter}${params.type}`;
        }
        // Attach params and schema to item
        super({
            attrs,
            schema: require('./schema').dynamo
        });
    }

    async create() {
        console.log(this.get('type'));
        if (this.get('type') === 0) {
            const { Item: user } = await documentClient.get({
                TableName: config.tableNames.users,
                Key: {
                    userId: this.get('userId'),
                    itemKey: 'base'
                }
            }).promise();
            const searchTerms = [user.username];
            const firstName = this.get('firstName');
            const middleName = this.get('middleName');
            const lastName = this.get('lastName');

            if (firstName) {
                firstName.split(' ').forEach((n) => searchTerms.push(n.toLowerCase()));
            }
            if (middleName) {
                middleName.split(' ').forEach((n) => searchTerms.push(n.toLowerCase()));
            }
            if (lastName) {
                lastName.split(' ').forEach((n) => searchTerms.push(n.toLowerCase()));
            }

            console.log(searchTerms.join(' '));

            await documentClient.update({
                TableName: config.tableNames.users,
                Key: {
                    userId: user.userId,
                    itemKey: user.itemKey,
                },
                UpdateExpression: 'set #s = :s',
                ExpressionAttributeNames: { '#s': 'searchTerms' },
                ExpressionAttributeValues: { ':s': searchTerms.join(' ') },
            }).promise();
        }
        await super.create();
    }
}

module.exports = Contacts;
