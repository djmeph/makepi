const models = require('../../models');
const config = require('../../config');

module.exports = {
    method: 'POST',
    endpoint: '/subscriptions',
    access: [config.access.level.member],
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
