const models = require('../../models');

module.exports = {
    method: 'GET',
    endpoint: '/user',
    validate: {
        response: models.users.schema.get.response
    },
    middleware: [async (req, res, next) => {
        try {
            const user = await models.users.table.get(req.user.sub);
            if (!user) {
                req.data = { status: 404, response: { message: 'NOT FOUND' } };
            } else {
                req.data = { status: 200, response: user.get() };
            }
            next();
        } catch (err) { req.fail(err); }
    }]
};
