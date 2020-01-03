/**
* [POST] User login
* @param { String } old # Old Password
* @param { String } new # New Password
*/

const models = require('../../models');

module.exports = {
    method: 'POST',
    endpoint: '/change-password',
    validate: {
        body: models.users.schema.changePassword.body
    },
    middleware: [async (req, res, next) => {
        try {
            // Check if user exists
            const user = await models.users.table.get(req.user.sub);

            // Check if password matches
            const authenticated = await user.checkPassword(req.body.old);
            if (!authenticated) {
                req.data = { status: 401, response: { message: 'Unauthorized' } };
                return next();
            }

            // Reset Password
            const passwordHash = await user.saltAndHashPassword(req.body.new);
            user.set('passwordHash', passwordHash);
            await user.update();

            req.data = { status: 200 };
            next();
        } catch (err) { req.fail(err); }
    }]
};
