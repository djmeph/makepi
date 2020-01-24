const models = require('../../../models');

module.exports = {
    method: 'POST',
    endpoint: '/contacts/:type',
    validate: {
        params: models.contacts.schema.user.params,
        body: models.contacts.schema.user.post.body,
        response: models.contacts.schema.user.response
    },
    middleware: [async (req, res, next) => {
        try {
            const contact = new models.contacts.Item({ ...req.body, ...req.params, userId: req.user.sub });
            await contact.create();
            req.data = { status: 200, response: contact.get() };
            next();
        } catch (err) { req.fail(err); }
    }]
};
