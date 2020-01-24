const models = require('../../../models');

module.exports = {
    method: 'GET',
    endpoint: '/contacts/:type',
    validate: {
        params: models.contacts.schema.user.params,
        response: models.contacts.schema.user.response
    },
    middleware: [async (req, res, next) => {
        try {
            const contact = await models.contacts.table.get({
                userId: req.user.sub,
                type: req.params.type,
            });
            if (!contact) {
                req.data = { status: 404, response: { message: 'NOT FOUND' } };
                return next();
            }
            req.data = { status: 200, response: contact.get() };
            next();
        } catch (err) { req.fail(err); }
    }]
};
