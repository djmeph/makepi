const config = require('../../config');

module.exports = {
  TableName: config.tableNames.plans,
  AttributeDefinitions: [
    {
      AttributeName: 'planId',
      AttributeType: 'S'
    },
    {
      AttributeName: 'itemKey',
      AttributeType: 'S'
    }
  ],
  KeySchema: [{
    AttributeName: 'planId',
    KeyType: 'HASH'
  }, {
    AttributeName: 'itemKey',
    KeyType: 'RANGE'
  }],
  BillingMode: 'PAY_PER_REQUEST',
  SSESpecification: {
    Enabled: true
  },
  GlobalSecondaryIndexes: []
};
