const models = require('../../models');
const config = require('../../config');

module.exports = {
    method: 'GET',
    endpoint: '/plans/:planId/:versionNumber',
    validate: {
        params: models.plans.schema.get.params
    },
    middleware: [async (req, res, next) => {
        try {
            const plan = await models.plans.table.get(req.params);
            req.data = { status: 200, response: plan.get() };
            next();
        } catch (err) { req.fail(err); }
    }]
};
