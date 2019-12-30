/*
 * Users model item class:
 * Promisified Item with History
 */
const { PromisifiedItem } = require('dynamodb-wrapper');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const config = require('../../config');
const utils = require('../../utils');

const { SALT_WORK_FACTOR } = config;
const documentClient = new AWS.DynamoDB.DocumentClient({
    version: config.awsConfig.apiVersions.dynamodb,
    region: config.awsConfig.region
});

class Users extends PromisifiedItem {
    /**
   * @param  {} params={}
   * @param { String } params.itemKey
   * @param { String } params.userId
   * @param { String } params.username
   * @param { String } params.password
   */
    constructor(params = {}) {
        const attrs = { ...params };
        // If itemKey not provided use default
        if (typeof params.itemKey === 'undefined') {
            attrs.itemKey = config.itemKeyPrefixes.users;
        }
        // If id not provided generate new UUID
        if (typeof params.userId === 'undefined') {
            attrs.userId = utils.uuid();
        }
        // Attach params and schema to item
        super({
            attrs,
            schema: require('./schema').dynamo
        });
    }

    async create() {
    // Hash and salt password if set
        const password = this.get('password');
        if (password) {
            const passwordHash = await this.saltAndHashPassword(password);
            this.set('passwordHash', passwordHash);
            this.remove('password');
        }
        // convert username to all lower case
        this.set('username', this.get('username').toLowerCase());
        // Check for duplicate usernames
        const result = await documentClient.query({
            IndexName: 'username-index',
            TableName: config.tableNames.users,
            KeyConditionExpression: 'username = :username',
            ExpressionAttributeValues: {
                ':username': this.get('username')
            }
        }).promise();
        // If username exists throw error
        if (result.Count) throw new Error('Duplicate username found');
        // Return promise
        return super.create();
    }

    async saltAndHashPassword(password) {
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }

    getToken(expiry) {
        const sub = this.get('userId');
        const token = expiry
            ? jwt.sign({ sub }, config.JWT_SECRET, { expiresIn: config.EXPIRY })
            : jwt.sign({ sub }, config.JWT_SECRET);
        return token;
    }

    async checkPassword(password) {
        const result = await bcrypt.compare(password, this.get('passwordHash'));
        return result;
    }
}

module.exports = Users;
