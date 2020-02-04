const models = require('../../../models');
const config = require('../../../config');

module.exports = {
    method: 'GET',
    endpoint: '/schedules/:status',
    access: [config.access.level.onboarding, config.access.level.member],
    validate: {
        params: models.schedules.schema.getStatus
    },
    middleware: [async (req, res, next) => {
        try {
            const schedules = await models.schedules.table.getByUserIdAndStatus({
                userId: req.user.sub,
                status: Number(req.params.status),
            });
            req.data = { status: 200, response: schedules.map((n) => n.get()) };
            next();
        } catch (err) { req.fail(err); }
    }]
};
