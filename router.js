const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const routesDir = `${__dirname}/routes`;
const jsFileRegex = /\.js$/;

function requireName(filename) {
  const modulePath = filename.replace(jsFileRegex, '');
  return path.resolve(modulePath);
}

function getRoutes(dir) {
  fs.readdirSync(dir).forEach((filename) => {
    const fullPath = `${dir}/${filename}`;

    if (!jsFileRegex.test(filename)) {
      const { isDirectory } = fs.statsSync(fullPath);
      if (isDirectory()) {
        getRoutes(fullPath);
      }
      return;
    }

    // eslint-disable-next-line import/no-dynamic-require
    const route = require(requireName(fullPath));
    router[route.method](
      route.endpoint,
      _.merge([bodyParser.json(), route.middleware]),
      (req, res) => res.status(req.data.status).json(req.data.body)
    );
  });
}

module.exports = () => {
  getRoutes(routesDir);
  return router;
};
