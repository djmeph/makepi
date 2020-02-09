const models = require('../../../models');
const config = require('../../../config');

module.exports = {
    method: 'GET',
    endpoint: '/admin/schedules/:userId/:status',
    access: [config.access.level.keyMaster],
    validate: {
        params: models.schedules.schema.admin.getUser.params
    },
    middleware: [async (req, res, next) => {
        try {
            const schedules = await models.schedules.table.getByUserIdAndStatus({
                userId: req.params.userId,
                status: Number(req.params.status),
            });
            req.data = { status: 200, response: schedules.map((n) => n.get()) };
            next();
        } catch (err) { req.fail(err); }
    }]
};
