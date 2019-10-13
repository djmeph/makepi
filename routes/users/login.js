/**
 * [POST] User login
 * @param { String } username
 * @param { String } password
 * @param { Boolean } remember
 */

const models = require('../../models');
const config = require('../../config');

module.exports = {
  method: 'POST',
  endpoint: '/login',
  validate: {
    body: models.users.schema.login.body
  },
  middleware: [async (req, res, next) => {
    try {
      // Check if user exists
      const user = await models.users.table.getByUsername(req.body.username);
      if (!user) {
        req.data = { status: 403, response: { message: 'Username not found' } };
        return next();
      }
      // Check password against hash
      const authenticated = await user.checkPassword(req.body.password);
      if (!authenticated) {
        req.data = { status: 403, response: { message: 'Unauthorized' } };
        return next();
      }
      // Generate token, set expiration if remember set to false
      const token = user.getToken(req.body.remember ? 0 : config.EXPIRY);

      // Return token to user
      req.data = { status: 200, response: { token } };
      next();
    } catch (err) { req.fail(err); }
  }]
};
