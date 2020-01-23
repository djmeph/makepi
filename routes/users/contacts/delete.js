const models = require('../../../models');

module.exports = {
    method: 'DELETE',
    endpoint: '/contacts/:contactId',
    validate: {
        params: models.contacts.schema.user.params
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
            await contact.remove();
            req.data = { status: 200 };
            next();
        } catch (err) { req.fail(err); }
    }]
};
