const DB = require('dynamodb-wrapper');
const config = require('../../config');

const Schema = DB.schema(config.awsConfig);
const { joi } = DB;

const userId = joi.string()
  .description('User ID');

const itemKey = joi.string()
  .description('Subscription Key');

const planId = joi.string()
  .description('Plan ID');

const stripePaymentMethodId = joi.string()
  .description('Unique ID for Stripe Payment Method Item');

module.exports = {
  elements: {
    userId,
    itemKey,
    planId,
  },
  dynamo: new Schema({
    tableName: config.tableNames.users,
    key: {
      hash: 'userId',
      range: 'itemKey'
    },
    timestamps: true,
    schema: {
      userId: userId.required(),
      itemKey: itemKey.required(),
      planId: planId.required(),
      stripePaymentMethodId: stripePaymentMethodId.required(),
    }
  })
};
