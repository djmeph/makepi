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

const versionNumber = joi.number()
  .description('Plan Version Number');

const stripePaymentMethodId = joi.string()
  .description('Unique ID for Stripe Payment Method Item');

const output = joi.object({
  plan: joi.object({
    planId: planId.required(),
    versionNumber: versionNumber.required()
  }).required(),
  stripePaymentMethodId: stripePaymentMethodId.required(),
  versionNumber: versionNumber.required()
});

module.exports = {
  elements: {
    userId,
    itemKey,
    plan: {
      planId,
      versionNumber
    },
    stripePaymentMethodId
  },
  post: {
    body: joi.object({
      plan: joi.object({
        planId: planId.required(),
        versionNumber: versionNumber.required()
      }),
      stripePaymentMethodId: stripePaymentMethodId.required()
    })
  },
  get: {
    response: output
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
      plan: joi.object({
        planId: planId.required(),
        versionNumber: versionNumber.required()
      }).required(),
      stripePaymentMethodId: stripePaymentMethodId.required(),
      versionNumber: versionNumber.required()
    }
  })
};
