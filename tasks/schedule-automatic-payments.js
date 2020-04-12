const _ = require('lodash');
const PaymentScheduler = require('../services/payment-scheduler');

module.exports = async () => {
    const paymentScheduler = new PaymentScheduler();
    // Process subscriptions async.
    const processed = await paymentScheduler.run();
    paymentScheduler.log.info({ scheduled: _.filter(processed, (n) => !!n).length });
};
