const models = require('../../../models');
const config = require('../../../config');

module.exports = {
    method: 'DELETE',
    endpoint: '/admin/contacts/:userId/:type',
    access: [config.access.level.keyMaster],
    validate: {
        params: models.contacts.schema.admin.params
    },
    middleware: [async (req, res, next) => {
        try {
            const contact = await models.contacts.table.get(req.params);
            if (!contact) {
                req.data = { status: 404, response: { message: 'NOT FOUND' } };
                return next();
            }
            contact.delete((err) => {
                if (err) return req.fail(err);
                req.data = { status: 200 };
                next();
            });
        } catch (err) { req.fail(err); }
    }]
};
