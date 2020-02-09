const models = require('../../../models');
const config = require('../../../config');

module.exports = {
    method: 'GET',
    endpoint: '/admin/subscription/:userId',
    access: [config.access.level.keyMaster],
    validate: {
        response: models.subscriptions.schema.admin.getall
    },
    middleware: [async (req, res, next) => {
        try {
            const subscription = await models.subscriptions.table.getLatest(req.params.userId);
            req.data = { status: 200, response: subscription.get() };
            next();
        } catch (err) { req.fail(err); }
    }]
};
