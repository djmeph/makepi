const models = require('../../../models');

module.exports = {
  method: 'POST',
  endpoint: '/stripe-payment-methods',
  validate: {
    body: models.stripePaymentMethods.schema.post.body,
    response: models.stripePaymentMethods.schema.post.response
  },
  middleware: [async (req, res, next) => {
    let stripe;
    let customer;
    let stripePaymentMethods;
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
      stripePaymentMethods = new models.stripePaymentMethods.Item({
        userId: req.user.sub,
        source
      });
      await stripePaymentMethods.create();

      // Return Stripe source data
      req.data = { status: 200, response: stripePaymentMethods.get() };
      next();
    } catch (err) { req.fail(err); }
  }]
};
