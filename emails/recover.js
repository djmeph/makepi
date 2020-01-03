const AWS = require('aws-sdk');
const models = require('../models');

const ses = new AWS.SES();

module.exports = async (event) => {
    const sourceEmail = await models.settings.table.get('source-email');
    await Promise.all(event.Records.map(async (message) => {
        const body = JSON.parse(message.body);
        const user = await models.users.table.get(body.userId);
        if (!user) throw new Error('User not found');
        await ses.sendEmail({
            Destination: {
                ToAddresses: [user.get('username')]
            },
            Message: {
                Body: {
                    Text: {
                        Charset: 'UTF-8',
                        Data: `Your recovery code is: ${user.get('recoverCode')}`
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: 'MakePI Recovery Code',
                }
            },
            Source: sourceEmail.value
        }).promise();
    }));
};
