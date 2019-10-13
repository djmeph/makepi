const { PromisifiedTable } = require('dynamodb-wrapper');
const config = require('../../config');

class UsersTable extends PromisifiedTable {
  async get(id) { // Query by ID
    const result = await super.get({
      id,
      key: config.itemKeyPrefixes.users
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
}

module.exports = new UsersTable({
  schema: require('./schema').dynamo,
  itemConstructor: require('./item')
});
