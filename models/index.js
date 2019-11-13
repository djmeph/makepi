/*
 * Joi-based Models/Validation for DynamoDB
 * https://www.github.com/qloan/dynamodb-wrapper.git
 *
 * Each model should export the following modules:
 *
 * schema - instantiates DynamoDB Schema instance and exports payload validations related to the model
 * item - instantiates new instance of a documentClient item using DynamoDB schema
 * table - contains functions to query records within this model
 * tableDefinition (optional) - Contains parameters for base table.
 */

module.exports = {
  users: require('./users'),
  settings: require('./settings'),
  stripePaymentMethods: require('./stripe-payment-methods'),
  plans: require('./plans'),
  subscriptions: require('./subscriptions')
};
