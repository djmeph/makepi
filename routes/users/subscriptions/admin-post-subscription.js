const models = require('../../../models');
const config = require('../../../config');

module.exports = {
    method: 'POST',
    endpoint: '/admin/subscription/:userId',
    access: [config.access.level.keyMaster],
    validate: {
        response: models.subscriptions.schema.admin.getall
    },
    middleware: [async (req, res, next) => {
        try {
            const subcription = new models.subscriptions.Item({ ...req.params, ...req.body });
            await subcription.create();
            req.data = { status: 200, response: subcription.get() };
            next();
        } catch (err) { req.fail(err); }
    }]
};
