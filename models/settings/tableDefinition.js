const config = require('../../config');

module.exports = {
    TableName: config.tableNames.settings,
    AttributeDefinitions: [
        {
            AttributeName: 'settingId',
            AttributeType: 'S'
        },
        {
            AttributeName: 'itemKey',
            AttributeType: 'S'
        }
    ],
    KeySchema: [{
        AttributeName: 'settingId',
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
