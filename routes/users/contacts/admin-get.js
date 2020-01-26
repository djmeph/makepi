const models = require('../../../models');
const config = require('../../../config');

module.exports = {
    method: 'GET',
    endpoint: '/admin/contacts/:userId/:type',
    access: [config.access.level.keyMaster],
    validate: {
        params: models.contacts.schema.admin.params,
        response: models.contacts.schema.admin.response
    },
    middleware: [async (req, res, next) => {
        try {
            console.log(req.params)
            const contact = await models.contacts.table.get(req.params);
            if (!contact) {
                req.data = { status: 404, response: { message: 'NOT FOUND' } };
                return next();
            }
            req.data = { status: 200, response: contact.get() };
            next();
        } catch (err) { req.fail(err); }
    }]
};
