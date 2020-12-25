const _ = require('lodash');
const models = require('../../../models');
const config = require('../../../config');

module.exports = {
    method: 'GET',
    endpoint: '/admin/subscriptions/latest',
    access: [config.access.level.keyMaster],
    validate: {
        response: models.subscriptions.schema.admin.getall
    },
    middleware: [async (req, res, next) => {
        try {
            const subscriptions = await models.subscriptions.table.getAllLatest();
            const response = await Promise.all(subscriptions.map(async (subscription) => {
                const planKey = subscription.get('plan');
                if (!planKey || planKey.planId === 'cancel') return { subscription: subscription.get() };
                const plan = await models.plans.table.get(planKey);
                const user = await models.users.table.get(subscription.get('userId'));
                if (!user) return { subscription: subscription.get() };
                return {
                    subscription: subscription.get(),
                    plan: plan.get(),
                    user: user.get(),
                };
            }));
            req.data = { status: 200, response: _.filter(response, (n) => n.subscription.plan.planId !== 'cancel') };
            next();
        } catch (err) { req.fail(err); }
    }]
};
