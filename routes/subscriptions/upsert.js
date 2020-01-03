const models = require('../../models');

module.exports = {
    method: 'POST',
    endpoint: '/subscriptions',
    validate: {
        body: models.subscriptions.schema.post.body
    },
    middleware: [async (req, res, next) => {
        try {
            const subscription = new models.subscriptions.Item({ ...req.body, userId: req.user.sub });
            await subscription.create();
            req.data = { status: 200 };
            next();
        } catch (err) { req.fail(err); }
    }]
};
