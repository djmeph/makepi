const config = require('../../config');

module.exports = {
  TableName: config.tableNames.settings,
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: 'S'
    },
    {
      AttributeName: 'key',
      AttributeType: 'S'
    }
  ],
  KeySchema: [{
    AttributeName: 'id',
    KeyType: 'HASH'
  }, {
    AttributeName: 'key',
    KeyType: 'RANGE'
  }],
  BillingMode: 'PAY_PER_REQUEST',
  SSESpecification: {
    Enabled: true
  },
  GlobalSecondaryIndexes: []
};
