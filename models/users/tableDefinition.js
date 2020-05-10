const config = require('../../config');

module.exports = {
    TableName: config.tableNames.users,
    AttributeDefinitions: [
        {
            AttributeName: 'userId',
            AttributeType: 'S'
        },
        {
            AttributeName: 'itemKey',
            AttributeType: 'S'
        },
        {
            AttributeName: 'username',
            AttributeType: 'S'
        },
        {
            AttributeName: 'type',
            AttributeType: 'N'
        },
        {
            AttributeName: 'active',
            AttributeType: 'N'
        },
        {
            AttributeName: 'status',
            AttributeType: 'N'
        },
        {
            AttributeName: 'stripeSourceId',
            AttributeType: 'S'
        }
    ],
    KeySchema: [{
        AttributeName: 'userId',
        KeyType: 'HASH'
    }, {
        AttributeName: 'itemKey',
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
        }, {
            IndexName: 'type-index',
            KeySchema: [
                {
                    AttributeName: 'type',
                    KeyType: 'HASH'
                }
            ],
            Projection: {
                ProjectionType: 'ALL'
            }
        }, {
            IndexName: 'active-index',
            KeySchema: [
                {
                    AttributeName: 'active',
                    KeyType: 'HASH'
                }
            ],
            Projection: {
                ProjectionType: 'ALL'
            }
        }, {
            IndexName: 'itemKey-index',
            KeySchema: [
                {
                    AttributeName: 'itemKey',
                    KeyType: 'HASH'
                }
            ],
            Projection: {
                ProjectionType: 'ALL'
            }
        }, {
            IndexName: 'status-index',
            KeySchema: [
                {
                    AttributeName: 'status',
                    KeyType: 'HASH'
                }
            ],
            Projection: {
                ProjectionType: 'ALL'
            }
        }, {
            IndexName: 'stripeSourceId-index',
            KeySchema: [
                {
                    AttributeName: 'stripeSourceId',
                    KeyType: 'HASH'
                }
            ],
            Projection: {
                ProjectionType: 'ALL'
            }
        }
    ]
};
