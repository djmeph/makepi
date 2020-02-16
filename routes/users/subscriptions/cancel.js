const models = require('../../../models');
const config = require('../../../config');

module.exports = {
    method: 'DELETE',
    endpoint: '/subscriptions/latest',
    access: [config.access.level.onboarding, config.access.level.member],
    middleware: [async (req, res, next) => {
        try {
            const user = await models.users.table.get(req.user.sub);
            if (!user) {
                req.data = { status: 404, response: { message: 'NOT FOUND' } };
                return next();
            }
            const response = await user.cancelSubscription();
            req.data = { status: 200, response };
            next();
        } catch (err) { req.fail(err); }
    }]
};
