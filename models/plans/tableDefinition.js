const config = require('../../config');

module.exports = {
  TableName: config.tableNames.plans,
  AttributeDefinitions: [
    {
      AttributeName: 'planId',
      AttributeType: 'S'
    },
    {
      AttributeName: 'key',
      AttributeType: 'S'
    }
  ],
  KeySchema: [{
    AttributeName: 'planId',
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
