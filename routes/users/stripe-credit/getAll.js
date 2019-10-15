const models = require('../../../models');

module.exports = {
  method: 'GET',
  endpoint: '/stripe-credits',
  validate: {
    response: models.stripeCredits.schema.getAll.response
  },
  middleware: [async (req, res, next) => {
    try {
      const stripeCredits = await models.stripeCredits.table.getAll(req.user.sub);
      req.data = { status: 200, response: stripeCredits.map((n) => n.get()) };
      next();
    } catch (err) { req.fail(err); }
  }]
};
