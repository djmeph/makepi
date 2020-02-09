const models = require('../../../models');
const config = require('../../../config');

module.exports = {
    method: 'POST',
    endpoint: '/admin/schedules',
    access: [config.access.level.keyMaster],
    validate: {
        body: models.schedules.schema.admin.post.body
    },
    middleware: [async (req, res, next) => {
        try {
            const schedule = new models.schedules.Item(req.body);
            await schedule.create();
            req.data = { status: 200, response: schedule.get() };
            next();
        } catch (err) { req.fail(err); }
    }]
};
