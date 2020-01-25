const models = require('../../../models');
const config = require('../../../config');

module.exports = {
    method: 'POST',
    endpoint: '/admin/contacts/:userId/:type',
    access: [config.access.level.keyMaster],
    validate: {
        params: models.contacts.schema.admin.params,
        body: models.contacts.schema.admin.post.body,
        response: models.contacts.schema.admin.response
    },
    middleware: [async (req, res, next) => {
        try {
            const contact = new models.contacts.Item({ ...req.body, ...req.params });
            await contact.create();
            req.data = { status: 200, response: contact.get() };
            next();
        } catch (err) { req.fail(err); }
    }]
};
