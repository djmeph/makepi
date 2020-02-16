const models = require('../../../models');
const config = require('../../../config');

module.exports = {
    method: 'DELETE',
    endpoint: '/admin/subscription/:userId',
    access: [config.access.level.keyMaster],
    middleware: [async (req, res, next) => {
        try {
            const user = await models.users.table.get(req.params.userId);
            if (!user) {
                req.data = { status: 404, response: { message: 'NOT FOUND ' } };
                return next();
            }
            await user.cancelSubscription();
            req.data = { status: 200 };
            next();
        } catch (err) { req.fail(err); }
    }]
};
