const { joi } = require('dynamodb-wrapper');

module.exports = joi.array().items(joi.object().keys({
    field: joi.string(),
    newValue: joi.any(),
    oldValue: joi.any(),
    timestamp: joi.string().isoDate(),
}));
