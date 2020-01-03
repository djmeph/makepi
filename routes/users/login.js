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
                req.data = { status: 401, response: { message: 'Username not found' } };
                return next();
            }
            // Check if account locked
            if (user.isLocked()) {
                req.data = { status: 401, response: { message: 'Account is locked' } };
                return next();
            }
            // Check password against hash
            const authenticated = await user.checkPassword(req.body.password);
            if (!authenticated) {
                await user.incLoginAttempts();
                req.data = { status: 401, response: { message: 'Unauthorized' } };
                return next();
            }

            // Reset Login Attempts
            await user.resetLoginAttempts();

            // Generate token, set expiration if remember set to false
            const token = user.getToken(req.body.remember ? 0 : config.EXPIRY);

            // Return token to user
            req.data = { status: 200, response: { token } };
            next();
        } catch (err) { req.fail(err); }
    }]
};
