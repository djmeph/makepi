const _ = require('lodash');
const models = require('../../models');
const config = require('../../config');

module.exports = {
  method: 'POST',
  endpoint: '/plans',
  access: [config.access.level.admin],
  validate: {
    body: models.plans.schema.post.body
  },
  middleware: [async (req, res, next) => {
    try {
      const plan = new models.plans.Item({ ...req.body });
      await plan.create();
      req.data = { status: 200 };
      next();
    } catch (err) { req.fail(err); }
  }]
};
