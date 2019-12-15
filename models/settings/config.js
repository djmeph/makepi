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
    }
};

module.exports = {
    types,
    items
};
