/**
* [POST] User login
* @param { String } username
*/

const AWS = require('aws-sdk');
const models = require('../../models');
const utils = require('../../utils');

const sqs = new AWS.SQS();

module.exports = {
    method: 'POST',
    endpoint: '/recover-code',
    validate: {
        body: models.users.schema.recoverCode.body
    },
    middleware: [async (req, res, next) => {
        try {
            // Check if user exists
            const user = await models.users.table.getByUsername(req.body.username);
            if (!user) {
                req.data = { status: 401, response: { message: 'Username not found' } };
                return next();
            }

            // Generate UUID
            const url = await models.settings.table.get('sqs-recover-url');
            const uuid = utils.uuid();
            user.set('recoverCode', uuid);
            await user.update();
            await sqs.sendMessage({
                MessageBody: JSON.stringify({ userId: user.get('userId') }),
                QueueUrl: url.value,
            }).promise();

            req.data = { status: 200 };
            next();
        } catch (err) { req.fail(err); }
    }]
};
