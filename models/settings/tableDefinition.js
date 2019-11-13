const config = require('../../config');

module.exports = {
  TableName: config.tableNames.settings,
  AttributeDefinitions: [
    {
      AttributeName: 'settingsId',
      AttributeType: 'S'
    },
    {
      AttributeName: 'key',
      AttributeType: 'S'
    }
  ],
  KeySchema: [{
    AttributeName: 'settingsId',
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