const models = require('../../../models');

module.exports = {
  method: 'POST',
  endpoint: '/stripe-credit',
  validate: {
    body: models.stripeCredit.schema.post.body,
    response: models.stripeCredit.schema.post.response
  },
  middleware: [async (req, res, next) => {
    let stripe;
    let customer;
    let stripeCredit;
    try {
      // Get Stripe secret key from database.
      const { value: stripeKey } = await models.settings.table.get('stripe-key');
      stripe = require('stripe')(stripeKey);
      // Attempt to fetch customer
      customer = await stripe.customers.retrieve(req.user.sub);
    } catch (err) {
      // Create customer if they dont' exist yet
      if (err.statusCode === 404) customer = await stripe.customers.create({ id: req.user.sub });
      else return req.fail(err);
    }
    try {
      // Create source and attach to customer using public token
      const source = await stripe.customers.createSource(customer.id, {
        source: req.body.publicToken
      });

      // Insert source data into database
      stripeCredit = new models.stripeCredit.Item({
        id: req.user.sub,
        source
      });
      await stripeCredit.create();

      // Return Stripe source data
      req.data = { status: 200, response: stripeCredit.get() };
      next();
    } catch (err) { req.fail(err); }
  }]
};
