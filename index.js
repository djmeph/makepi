/**
 * MakePI
 * An Open Source Makerspace CRM API
 *
 * Exports serverless handler for publishing Express
 * API to Lambda using API Gateway trigger
 * See `examples` directory for configuration examples
 */

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const router = require('./router');
const { jwt } = require('./services');
const webhooks = require('./webhooks');

// Build express api and export to serverless or vanilla nodeJS
const api = express();

// Set headers explicitly for browser compatibility
api.use((req, res, next) => {
    // Allow all origins in browsers
    res.header('Access-Control-Allow-Origin', '*');
    // Set allowed headers
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    // Set allowed methods
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// parse all requests as JSON
api.use(bodyParser.json({ type: 'application/json' }));

// Authenticate token and reject unauthorized access
api.use('/', jwt);

// Initialize routes
api.use('/', router());

// 404 Not Found fallback
api.use((req, res) => {
    res.status(404).json({ message: 'NOT FOUND' });
});

api.use((err, req, res) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ message: 'Invalid Token' });
    } else if (err.type === 'entity.parse.failed') {
        res.status(400).json({ message: 'Malformed body parameters' });
    } else {
        res.status(500).json({ message: 'Unkown Error' });
    }
});

module.exports = {
    // Wrap Express api in serverless adapter and export to Lambda handler
    apiHandler: serverless(api),
    webhooksHandler: serverless(webhooks),
    api,
    webhooks
};
