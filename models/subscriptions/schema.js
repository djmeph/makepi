const DB = require('dynamodb-wrapper');
const config = require('../../config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const userId = joi.string()
  .description('User ID');

const key = joi.string()
  .description('Subscription Key');

const planId = joi.string()
  .description('Plan ID');

const stripePaymentMethodId = joi.string()
  .description('Unique ID for Stripe Payment Method Item');

module.exports = {
  elements: {
    userId,
    key,
    planId,
  },
  dynamo: new Schema({
    tableName: config.tableNames.users,
    key: {
      hash: 'userId',
      range: 'key'
    },
    timestamps: true,
    schema: {
      userId: userId.required(),
      key: key.required(),
      planId: planId.required(),
      stripePaymentMethodId: stripePaymentMethodId.required(),
    }
  })
};
