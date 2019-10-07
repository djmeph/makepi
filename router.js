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

async function validateInput(req, res, next) {
  if (!req.validate) return next();
  let validations = [];
  switch (req.method.toUpperCase()) {
  case 'GET':
  case 'DELETE':
    validations = ['params', 'query'];
    break;
  case 'POST':
  case 'PUT':
    validations = ['params', 'body'];
    break;
  default:
  }
  for (let i = 0; i < validations.length; i++) {
    const validation = validations[i];
    if (req.validate[validation]) {
      let result;
      try {
        result = await req.validate[validation].validateAsync(req[validation], { stripUnknown: true });
      } catch (err) {
        return res.status(400).json({
          error: true,
          type: `Invalid Parameters: ${validation}`,
          message: err.message
        });
      }
      req[validation] = result;
    }
  }
  next();
}

async function validateOutput(req) {
  if (_.get(req, 'validate.response')) {
    const result = await req.validate.response.validateAsync(req.data.response, { stripUnknown: true });
    req.data.response = result;
  }
}

function getRoutes(dir) {
  fs.readdirSync(dir).forEach((filename) => {
    const fullPath = `${dir}/${filename}`;

    if (!jsFileRegex.test(filename)) {
      const stats = fs.lstatSync(fullPath);
      if (stats.isDirectory()) {
        getRoutes(fullPath);
      }
      return;
    }

    // eslint-disable-next-line import/no-dynamic-require
    const route = require(requireName(fullPath));
    router[route.method](
      route.endpoint,
      _.merge([
        bodyParser.json(),
        (req, res, next) => {
          req.validate = route.validate;
          next();
        },
        validateInput,
        route.middleware
      ]),
      async (req, res) => {
        try {
          await validateOutput(req);
          res.status(req.data.status).json(req.data.response);
        } catch (err) {
          res.status(500).json({
            error: true,
            type: 'Invalid Output: response',
            message: err.message
          });
        }
      }
    );
  });
}

module.exports = () => {
  getRoutes(routesDir);
  return router;
};
