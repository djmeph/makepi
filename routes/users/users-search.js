const models = require('../../models');

module.exports = {
    method: 'GET',
    endpoint: '/users-search',
    validate: {
        query: models.users.schema.search.query,
        response: models.users.schema.search.response
    },
    middleware: [async (req, res, next) => {
        try {
            const response = await models.users.table.search(req.query.key);
            req.data = {
                status: 200,
                response: response.map((item) => item.get())
            };
            return next();
        } catch (err) { req.fail(err); }
    }]
};
