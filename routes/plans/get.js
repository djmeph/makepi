const _ = require('lodash');
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
      const plan = await models.plans.table.get({
        planId: req.params.planId,
        itemKey: `${config.itemKeyPrefixes.plans}_v${req.params.versionNumber}`
      });
      req.data = { status: 200, response: plan.get() };
      next();
    } catch (err) { req.fail(err); }
  }]
};
