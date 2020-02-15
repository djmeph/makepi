const models = require('../../../models');
const config = require('../../../config');

module.exports = {
    method: 'GET',
    endpoint: '/admin/all-schedules/:status',
    access: [config.access.level.keyMaster],
    validate: {
        params: models.schedules.schema.admin.getAllUsers.params
    },
    middleware: [async (req, res, next) => {
        try {
            const schedules = await models.schedules.table.getAllByStatus({ status: Number(req.params.status) });
            req.data = { status: 200, response: schedules.map((n) => n.get()) };
            next();
        } catch (err) { req.fail(err); }
    }]
};
