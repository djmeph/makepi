const models = require('../../../models');
const config = require('../../../config');

module.exports = {
    method: 'PUT',
    endpoint: '/admin/schedules/:userId/:scheduleId',
    access: [config.access.level.keyMaster],
    validate: {
        params: models.schedules.schema.admin.put.params,
        body: models.schedules.schema.admin.put.body
    },
    middleware: [async (req, res, next) => {
        try {
            const schedule = await models.schedules.table.get({
                userId: req.params.userId,
                itemKey: `${config.itemKeyPrefixes.schedules}${config.itemKeyDelimiter}${req.params.scheduleId}`
            });
            Object.keys(req.body).map((key) => schedule.set(key, req.body[key]));
            await schedule.update();
            req.data = { status: 200, response: schedule.get() };
            next();
        } catch (err) { req.fail(err); }
    }]
};
