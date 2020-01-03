const AWS = require('aws-sdk');

const sqs = new AWS.SQS();

module.exports = {
    send: ({ url, message }) => sqs.sendMessage({
        MessageBody: JSON.stringify(message),
        QueueUrl: url,
    }).promise()
};
