/**
 * [POST] Register new user
 * @param { String } username
 * @param { String } password
 */

const models = require('../../models');
const UserItem = require('../../models/users/item');
const config = require('../../config');

module.exports = {
  method: 'POST',
  endpoint: '/register',
  validate: {
    body: models.users.schema.register.body
  },
  middleware: [async (req, res, next) => {
    try {
      // Create user in db
      const user = new UserItem(req.body);
      await user.create();

      // Generate token
      const token = user.getToken(config.EXPIRY);

      // Return token
      req.data = { status: 200, response: { token } };
      next();
    } catch (err) { req.fail(err); }
  }]
};
