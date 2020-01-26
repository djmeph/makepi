const models = require('../../models');
const config = require('../../config');

module.exports = {
    method: 'POST',
    endpoint: '/admin/users',
    access: [config.access.level.keyMaster],
    validate: {
        body: models.users.schema.admin.post.body,
        response: models.users.schema.admin.post.response
    },
    middleware: [async (req, res, next) => {
        try {
            const user = new models.users.Item(req.body);
            await user.create();
            req.data = { status: 200, response: user.get() };
            next();
        } catch (err) {
            req.fail(err);
        }
    }]
};
