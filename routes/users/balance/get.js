const Balance = require('../../../services/balance');
const { joi } = require('../../../models');

module.exports = {
    method: 'GET',
    endpoint: '/pending-balance',
    validate: {
        response: joi.object().keys({
            balance: joi.number(),
            payments: joi.number(),
            schedules: joi.number()
        })
    },
    middleware: [async (req, res, next) => {
        try {
            const balance = new Balance({ userId: req.user.sub });
            const response = await balance.getPending();
            req.data = { status: 200, response };
            next();
        } catch (err) { req.fail(err); }
    }]
};
