/*
 * Users model item class:
 * Promisified Item with History
 */
const { ItemWithHistory } = require('dynamodb-wrapper');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AWS = require('aws-sdk');
const config = require('../../config');
const utils = require('../../utils');

const genSalt = promisify(bcrypt.genSalt);
const genHash = promisify(bcrypt.hash);
const compare = promisify(bcrypt.compare);

const { SALT_WORK_FACTOR } = config;
const documentClient = new AWS.DynamoDB.DocumentClient({
  version: config.awsConfig.apiVersions.dynamodb,
  region: config.awsConfig.region
});

class Users extends ItemWithHistory {
  /**
   * @param  {} params={}
   * @param { String } params.key
   * @param { String } params.id
   * @param { String } params.username
   * @param { String } params.password
   */
  constructor(params = {}) {
    const attrs = { ...params };
    // If key not provided use default
    if (typeof params.key === 'undefined') {
      attrs.key = config.keyPrefixes.users;
    }
    // If id not provided generate new UUID
    if (typeof params.id === 'undefined') {
      attrs.id = utils.uuid();
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
    const salt = await genSalt(SALT_WORK_FACTOR);
    const hash = await genHash(password, salt, null);
    return hash;
  }

  getToken(expiry) {
    const sub = this.get('id');
    const token = expiry
      ? jwt.sign({ sub }, config.JWT_SECRET, { expiresIn: config.EXPIRY })
      : jwt.sign({ sub }, config.JWT_SECRET);
    return token;
  }

  async checkPassword(password) {
    const result = await compare(password, this.get('passwordHash'));
    return result;
  }
}

module.exports = Users;
