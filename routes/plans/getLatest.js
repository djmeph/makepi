const _ = require('lodash');
const models = require('../../models');

module.exports = {
  method: 'GET',
  endpoint: '/plans/latest',
  middleware: [async (req, res, next) => {
    try {
      let plans = await models.plans.table.getLatest();
      plans = _.sortBy(plans, (n) => n.get('sort'));
      req.data = { status: 200, response: plans.map((n) => n.get()) };
      next();
    } catch (err) { req.fail(err); }
  }]
};
