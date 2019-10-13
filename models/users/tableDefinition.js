const config = require('../../config');

module.exports = {
  TableName: config.tableNames.users,
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: 'S'
    },
    {
      AttributeName: 'key',
      AttributeType: 'S'
    },
    {
      AttributeName: 'username',
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
  GlobalSecondaryIndexes: [
    {
      IndexName: 'username-index',
      KeySchema: [
        {
          AttributeName: 'username',
          KeyType: 'HASH'
        }
      ],
      Projection: {
        ProjectionType: 'ALL'
      }
    }
  ]
};
