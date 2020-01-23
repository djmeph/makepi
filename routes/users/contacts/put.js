const models = require('../../../models');

module.exports = {
    method: 'PUT',
    endpoint: '/contacts/:contactId',
    validate: {
        params: models.contacts.schema.user.params,
        body: models.contacts.schema.user.post.body
    },
    middleware: [async (req, res, next) => {
        try {
            const { Item: contact } = await models.contacts.table.get({
                userId: req.user.sub,
                contactId: req.params.contactId,
            });
            if (!contact) {
                req.data = { status: 404, response: { message: 'NOT FOUND' } };
                return next();
            }
            Object.keys(req.body).map((key) => contact.set(key, req.body[key]));
            await contact.update();
            req.data = { status: 200, response: contact.get() };
            next();
        } catch (err) { req.fail(err); }
    }]
};
