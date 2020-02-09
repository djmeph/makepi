const models = require('../../models');
const config = require('../../config');

module.exports = {
    method: 'GET',
    endpoint: '/admin/user/:userId',
    access: [config.access.level.keyMaster],
    validate: {
        params: models.users.schema.admin.get.params,
        response: models.users.schema.list.response
    },
    middleware: [async (req, res, next) => {
        try {
            const response = await models.users.table.get(req.params.userId);
            req.data = { status: 200, response: response.get() };
            next();
        } catch (err) { req.fail(err); }
    }]
};
