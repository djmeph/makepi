const models = require('../../../models');
const config = require('../../../config');

module.exports = {
    method: 'POST',
    endpoint: '/subscriptions',
    access: [config.access.level.onboarding, config.access.level.member],
    validate: {
        body: models.subscriptions.schema.post.body
    },
    middleware: [async (req, res, next) => {
        try {
            const plan = await models.plans.table.get({
                planId: req.body.plan.planId,
                itemKey: `${config.itemKeyPrefixes.plans}_v${req.body.plan.versionNumber}`
            });
            if (!plan) {
                req.data = { status: 404 };
                return next();
            }
            const access = plan.get('access', []);
            let authorized = false;
            access.forEach((item) => {
                if (req.user.access.indexOf(item) >= 0) authorized = true;
            });
            if (req.user.access.indexOf(config.access.level.admin) >= 0) authorized = true;
            if (!authorized) {
                req.data = { status: 401 };
                return next();
            }
            const subscription = new models.subscriptions.Item({ ...req.body, userId: req.user.sub });
            await subscription.create();
            req.data = { status: 200 };
            next();
        } catch (err) { req.fail(err); }
    }]
};
