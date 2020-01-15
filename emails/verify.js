const models = require('../models');
const { ses } = require('../services');

module.exports = async (event) => {
    const sourceEmail = await models.settings.table.get('source-email');
    await Promise.all(event.Records.map(async (message) => {
        const body = JSON.parse(message.body);
        const user = await models.users.table.get(body.userId);
        if (!user) throw new Error('User not found');
        await ses.send({
            to: [user.get('username')],
            from: sourceEmail.value,
            subject: 'MakePI Email Verification',
            textBody: `Your verification code is: ${user.get('verificationCode')}`
        });
    }));
};
