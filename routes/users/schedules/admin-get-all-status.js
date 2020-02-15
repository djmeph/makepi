const _ = require('lodash');
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
            const response = await Promise.all(schedules.map(async (schedule) => {
                const contact = await models.contacts.table.get({
                    userId: schedule.get('userId'),
                    type: models.contacts.config.types.PRIMARY,
                });
                return {
                    schedule: schedule ? schedule.get() : undefined,
                    contact: contact ? contact.get() : undefined,
                };
            }));
            req.data = { status: 200, response: _.sortBy(response, 'schedule.paymentDate') };
            next();
        } catch (err) { req.fail(err); }
    }]
};
