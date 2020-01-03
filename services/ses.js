const AWS = require('aws-sdk');

const ses = new AWS.SES();

module.exports = {
    send: ({
        to, from, subject, textBody
    }) => ses.sendEmail({
        Destination: {
            ToAddresses: to
        },
        Message: {
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: textBody
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject,
            }
        },
        Source: from
    }).promise()
};
