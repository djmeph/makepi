/*
 * Users model item class:
 * Promisified Item with History
 */
const { PromisifiedItem } = require('dynamodb-wrapper');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const moment = require('moment-timezone');
const config = require('../../config');
const utils = require('../../utils');

const { SALT_WORK_FACTOR, MAX_LOGIN_ATTEMPTS, LOCK_TIME } = config;
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
        const username = this.get('username').toLowerCase();
        if (password) {
            const passwordHash = await this.saltAndHashPassword(password);
            this.set('passwordHash', passwordHash);
            this.remove('password');
        }
        // convert username to all lower case
        this.set('username', username);
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
        this.set('searchTerms', username);
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

    async incLoginAttempts() {
        // If account lock is set and it's in the past, reset login attempts at 1 and remove lock.
        const lockUntil = this.get('lockUntil');
        if (lockUntil && moment(lockUntil).isBefore(moment())) {
            this.set('loginAttempts', 1);
            this.remove('lockUntil');
            await this.update();
            return;
        }

        // Increase login Attmempts
        let loginAttempts = this.get('loginAttempts', 0);
        loginAttempts++;
        this.set('loginAttempts', loginAttempts);

        // Check login attempts and lock if maximum reached
        if (loginAttempts >= MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
            this.set('lockUntil', moment().add(LOCK_TIME, 'seconds').toISOString());
        }

        // Save everything
        await this.update();
    }

    isLocked() {
        const lockUntil = this.get('lockUntil');
        return lockUntil && moment(lockUntil).isAfter(moment());
    }

    async resetLoginAttempts() {
        const loginAttempts = this.get('loginAttempts');
        const lockUntil = this.get('lockUntil');
        if (!loginAttempts && !lockUntil) return;
        this.set('loginAttempts', 0);
        this.remove('lockUntil');
        await this.update();
    }

    async cancelSubscription() {
        const userId = this.get('userId');
        const { Item: latestSubscription } = await documentClient.get({
            TableName: config.tableNames.users,
            Key: {
                userId,
                itemKey: `${config.itemKeyPrefixes.subscriptions}_latest`,
            }
        }).promise();
        if (!latestSubscription) return;
        if (latestSubscription.plan.planId === 'cancel') return;
        const newHistoryItem = { ...latestSubscription };
        newHistoryItem.versionNumber += 1;
        newHistoryItem.itemKey = `${config.itemKeyPrefixes.subscriptions}_${newHistoryItem.versionNumber}`;
        newHistoryItem.plan = { planId: 'cancel' };
        newHistoryItem.paymentDay = 0;
        newHistoryItem.createdAt = moment().toISOString();
        newHistoryItem.paymentMethodKey = null;
        const newLatestItem = { ...newHistoryItem };
        newLatestItem.itemKey = `${config.itemKeyPrefixes.subscriptions}_latest`;
        await Promise.all([
            documentClient.put({
                TableName: config.tableNames.users,
                Item: newHistoryItem,
            }).promise(),
            documentClient.put({
                TableName: config.tableNames.users,
                Item: newLatestItem,
            }).promise(),
        ]);
    }
}

module.exports = Users;
