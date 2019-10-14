const models = require('../../../models');

module.exports = {
  method: 'POST',
  endpoint: '/stripe-credit',
  validate: {
    body: models.stripeCredit.schema.post.body
  },
  middleware: [async (req, res, next) => {
    try {
      req.data = { status: 200 };
      next();
    } catch (err) { req.fail(err); }
  }]
};
