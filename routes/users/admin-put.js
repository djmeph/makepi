const models = require('../../models');
const config = require('../../config');

module.exports = {
    method: 'PUT',
    endpoint: '/admin/users/:username',
    access: [config.access.level.keyMaster],
    validate: {
        params: models.users.schema.admin.put.params,
        body: models.users.schema.admin.put.body,
        response: models.users.schema.admin.put.response
    },
    middleware: [async (req, res, next) => {
        try {
            const user = await models.users.table.getByUsername(req.params.username);
            Object.keys(req.body).forEach((key) => {
                user.set(key, req.body[key]);
            });
            await user.update();
            req.data = { status: 200, response: user.get() };
            next();
        } catch (err) {
            req.fail(err);
        }
    }]
};
