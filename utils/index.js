const uuid = require('uuid/v4');

module.exports = {
  uuid,
  stripKeyPrefix: (key) => key.replace(/^[^#]+#(.*)$/, '$1')
};
