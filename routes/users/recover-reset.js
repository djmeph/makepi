/**
* [POST] User login
* @param { String } username
*/

const models = require('../../models');

module.exports = {
    method: 'POST',
    endpoint: '/recover-reset',
    validate: {
        body: models.users.schema.recoverReset.body
    },
    middleware: [async (req, res, next) => {
        try {
            // Check if user exists
            const user = await models.users.table.getByUsername(req.body.username);
            if (!user) {
                req.data = { status: 401, response: { message: 'Username not found' } };
                return next();
            }

            // Check if recovery code matches
            if (req.body.recoverCode !== user.get('recoverCode')) {
                req.data = { status: 401, response: { message: 'Invalid Recover Code' } };
                return next();
            }

            // Reset Password
            const passwordHash = await user.saltAndHashPassword(req.body.password);
            user.set('passwordHash', passwordHash);
            user.remove('recoverCode');
            await user.update();

            req.data = { status: 200 };
            next();
        } catch (err) { req.fail(err); }
    }]
};
