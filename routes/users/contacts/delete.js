const models = require('../../../models');

module.exports = {
    method: 'DELETE',
    endpoint: '/contacts/:type',
    validate: {
        params: models.contacts.schema.user.params
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
            await contact.delete();
            req.data = { status: 200 };
            next();
        } catch (err) { req.fail(err); }
    }]
};
