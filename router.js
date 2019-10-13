/*
 * Router initialization
 * Bootstraps all routes stored in the routes folder
 */

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const routesDir = `${__dirname}/routes`;
const jsFileRegex = /\.js$/;

// Creates string used to dynamically import route
function requireName(filename) {
  // Remove JS extension
  const modulePath = filename.replace(jsFileRegex, '');
  // Use path to generate relative path to module
  return path.resolve(modulePath);
}

// Validates input data attached to route object
async function validateInput(req, res, next) {
  // If there are no validation items found, skip.
  if (!req.validate) return next();
  // Create empty array to build list of validations to perform
  let validations = [];
  // Builds a list of potential validations for each method.
  switch (req.method.toUpperCase()) {
  // GET AND DELETE use query params
  case 'GET':
  case 'DELETE':
    validations = ['params', 'query'];
    break;
  // POST AND PUT use body params
  case 'POST':
  case 'PUT':
    validations = ['params', 'body'];
    break;
  // No validation for other methods. (ie. OPTIONS)
  default:
  }
  // Iterate through each validation
  for (let i = 0; i < validations.length; i++) {
    // Assign validation to a variable
    const validation = validations[i];
    // Check if validation was attached to the route
    if (req.validate[validation]) {
      // Promisify validation and reject if error found
      let result;
      try {
        result = await new Promise((resolve, reject) => {
          // Strip unkown keys from the input payload
          req.validate[validation].validate(req[validation], { stripUnknown: true }, (err, data) => {
            if (err) return reject(err);
            resolve(data);
          });
        });
      } catch (err) {
        return res.status(400).json({
          error: true,
          type: `Invalid Parameters: ${validation}`,
          message: err.message
        });
      }
      // If valid, reattach sanitized payload
      req[validation] = result;
    }
  }
  next();
}

// Builds routes by scanning for .js files in routes folder
// This function can be called within itself to scan recursively
function getRoutes(dir) {
  // Iterate through each file in target folder
  fs.readdirSync(dir).forEach((filename) => {
    // Build full path for this item.
    const fullPath = `${dir}/${filename}`;

    // Tests for .js extensions and directories
    // skips non-js files, scans directories recursively
    if (!jsFileRegex.test(filename)) {
      const stats = fs.lstatSync(fullPath);
      if (stats.isDirectory()) {
        getRoutes(fullPath);
      }
      return;
    }

    // Import route and build middleware flow.
    // eslint-disable-next-line import/no-dynamic-require
    const route = require(requireName(fullPath));
    // Attach route to method
    router[route.method.toLowerCase()](
      // Attach route to endpoint
      route.endpoint,
      _.merge([
        // Parse all payloads as JSON
        bodyParser.json(),
        (req, res, next) => {
          // Attach validations to request object
          req.validate = route.validate;
          // Attach universal fail function for returning uncaught errors.
          req.fail = (err) => {
            req.data = { status: err.statusCode || 500, response: { message: err.message } };
            next();
          };
          next();
        },
        // Validate all input payloads
        validateInput,
        // Process route logic middleware
        route.middleware
      ]),
      // Attach status code and data to response
      (req, res) => res.status(req.data.status).json(req.data.response)
    );
  });
}

module.exports = () => {
  getRoutes(routesDir);
  return router;
};
