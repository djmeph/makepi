const _ = require('lodash');
const models = require('../../models');
const config = require('../../config');

module.exports = {
  method: 'GET',
  endpoint: '/settings/:id',
  access: [config.access.level.admin],
  validate: {
    params: models.settings.schema.get.params
  },
  middleware: [async (req, res, next) => {
    try {
      const modelConfig = _.get(models, `settings.config.${req.params.id}`);
      if (!modelConfig) {
        req.data = { status: 404, response: { message: 'Invalid setting ID' } };
        return next();
      }
      const setting = await models.settings.table.get(req.params.id);
      req.data = { status: 200, response: setting };
      next();
    } catch (err) { req.fail(err); }
  }]
};
