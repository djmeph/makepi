const types = {
    number: 0,
    boolean: 1,
    json: 2,
    base64: 3,
    string: 4
};

const items = {
    'stripe-key': {
        type: types.string,
        label: 'Stripe API Key'
    },
    'source-email': {
        type: types.string,
        label: 'From Email'
    },
    'sqs-recover-url': {
        type: types.string,
        label: 'SQS Recover Queue URL'
    },
    'treasurer-email': {
        type: types.string,
        label: 'Treasurer Email'
    }
};

module.exports = {
    types,
    items
};
