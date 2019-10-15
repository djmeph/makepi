const models = require('../../../models');
const config = require('../../../config');

module.exports = {
  method: 'GET',
  endpoint: '/stripe-credits/:key',
  validate: {
    response: models.stripeCredits.schema.get.response
  },
  middleware: [async (req, res, next) => {
    try {
      const stripeCredit = await models.stripeCredits.table.get({
        id: req.user.sub,
        key: `${config.keyPrefixes.stripeCredits}${config.keyDelimiter}${req.params.key}`
      });
      if (!stripeCredit) req.data = { status: 404, response: { message: 'Not Found' } };
      else req.data = { status: 200, response: stripeCredit.get() };
      next();
    } catch (err) { req.fail(err); }
  }]
};
