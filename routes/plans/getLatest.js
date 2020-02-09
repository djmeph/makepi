const _ = require('lodash');
const models = require('../../models');
const config = require('../../config');

module.exports = {
    method: 'GET',
    endpoint: '/plans/latest',
    access: [config.access.level.onboarding, config.access.level.member],
    middleware: [async (req, res, next) => {
        try {
            let plans = await models.plans.table.getLatest();
            plans = _.filter(plans, (n) => {
                const plan = n.get();
                let authorized = false;
                plan.access.forEach((planId) => {
                    if (req.user.access.indexOf(planId) >= 0) {
                        authorized = true;
                    }
                });
                if (req.user.access.indexOf(config.access.level.admin) >= 0) authorized = true;
                return authorized;
            });
            plans = _.sortBy(plans, (n) => n.get('sort'));
            req.data = { status: 200, response: plans.map((n) => n.get()) };
            next();
        } catch (err) { req.fail(err); }
    }]
};
