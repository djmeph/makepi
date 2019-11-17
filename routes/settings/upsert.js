const _ = require('lodash');
const models = require('../../models');
const config = require('../../config');

module.exports = {
  method: 'POST',
  endpoint: '/settings',
  access: [config.access.level.admin],
  validate: {
    body: models.settings.schema.post.body
  },
  middleware: [async (req, res, next) => {
    try {
      const modelConfig = _.get(models, `settings.config.items.${req.body.settingId}`);
      if (!modelConfig) {
        req.data = { status: 404, response: { message: 'Invalid setting ID' } };
        return next();
      }
      const setting = new models.settings.Item({
        settingId: req.body.settingId,
        value: req.body.value,
        type: modelConfig.type,
        label: modelConfig.label
      });
      await setting.create();
      req.data = { status: 200 };
      next();
    } catch (err) { req.fail(err); }
  }]
};
