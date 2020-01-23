const models = require('../../../models');

module.exports = {
    method: 'POST',
    endpoint: '/contacts',
    validate: {
        body: models.contacts.schema.user.post.body
    },
    middleware: [async (req, res, next) => {
        try {
            const contact = new models.contacts.Item(req.body);
            await contact.create();
            req.data = { status: 200, response: contact.get() };
            next();
        } catch (err) { req.fail(err); }
    }]
};
