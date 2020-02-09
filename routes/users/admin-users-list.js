const models = require('../../models');
const config = require('../../config');

module.exports = {
    method: 'GET',
    endpoint: '/admin/users',
    access: [config.access.level.keyMaster],
    validate: {
        query: models.users.schema.list.query,
        response: models.users.schema.list.response
    },
    middleware: [async (req, res, next) => {
        try {
            const lastEvaluatedKey = req.query.userId && req.query.itemKey && req.query.active ? {
                userId: req.query.userId,
                itemKey: req.query.itemKey,
                active: Number(req.query.active)
            } : null;
            const response = await models.users.table.getAll(lastEvaluatedKey);
            req.data = {
                status: 200,
                response: {
                    lastEvaluatedKey: response.LastEvaluatedKey,
                    items: response.Items.map((item) => item.get())
                }
            };
            return next();
        } catch (err) { req.fail(err); }
    }]
};
