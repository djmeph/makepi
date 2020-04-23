process.env.AWS_REGION = 'us-east-1';

const sinon = require('sinon');
const { expect, assert } = require('chai');
const PaymentProcessor = require('../../services/payment-processor');
const models = require('../../models');
const fakeLogger = require('../util/fakeLogger');
const mocks = require('../util/mocks');
const {
    userId,
    paymentMethodKey,
    balance
} = mocks;
let schedule,
    subscriptionCashMonthly,
    subscriptionCreditMonthly,
    payment,
    paymentMethodCredit,
    user;

describe('UnitTests::', () => {
    describe('PaymentProcessor::', () => {
        let paymentProcessor;
        before(() => {
            sinon.stub(PaymentProcessor.prototype, 'charge').resolves(({ amount: balance, metadata: {} }));
            sinon.stub(PaymentProcessor.prototype, 'updateScheduledItem');
            sinon.stub(models.settings.table, 'get').resolves({ value: 'x' });
            sinon.stub(models.users.table, 'get').resolves(new models.users.Item(mocks.user));
        });
        beforeEach(() => {
            schedule = new models.schedules.Item(mocks.schedule);
            subscriptionCashMonthly = new models.subscriptions.Item(mocks.subscriptionCashMonthly);
            subscriptionCreditMonthly = new models.subscriptions.Item(mocks.subscriptionCreditMonthly);
            payment = new models.payments.Item(mocks.payment);
            paymentMethodCredit = new models.stripePaymentMethods.Item(mocks.paymentMethodCredit);
            user = new models.users.Item(mocks.user);
            sinon.stub(payment, 'create').resolves(payment);
            sinon.stub(schedule, 'update').resolves(schedule);
            paymentProcessor = new PaymentProcessor({
                log: fakeLogger
            });
        });
        it('Should return true if payment processing succeeds', async () => {
            sinon.stub(paymentProcessor, 'getBalance').resolves(balance);
            sinon.stub(paymentProcessor, 'getSubscription').resolves(subscriptionCreditMonthly);
            sinon.stub(paymentProcessor, 'getPaymentMethod').resolves(paymentMethodCredit);
            sinon.stub(paymentProcessor, 'putPaymentItem').resolves(payment);
            sinon.stub(paymentProcessor, 'paymentSuccessEmail').resolves();
            const result = await paymentProcessor.processScheduledPayment(schedule);
            assert(result);
        });
        it('Should return false if payment processing fails', async () => {
            sinon.stub(paymentProcessor, 'getBalance').resolves(balance);
            sinon.stub(paymentProcessor, 'getSubscription').rejects();
            const result = await paymentProcessor.processScheduledPayment(schedule);
            expect(result).to.equal(false);
        });
        it('Should pass and fail on a per schedule item basis', async () => {
            paymentProcessor.schedules = [schedule, schedule];
            sinon.stub(paymentProcessor, 'getBalance').resolves(balance);
            sinon.stub(paymentProcessor, 'getPaymentMethod').resolves(paymentMethodCredit);
            sinon.stub(paymentProcessor, 'putPaymentItem').resolves(payment);
            sinon.stub(paymentProcessor, 'paymentSuccessEmail');
            const getSubscriptionStub = sinon.stub(paymentProcessor, 'getSubscription');
            getSubscriptionStub.onCall(0).resolves(subscriptionCreditMonthly);
            getSubscriptionStub.onCall(1).rejects();
            await paymentProcessor.processScheduledPayments();
            assert(paymentProcessor.processed[0]);
            expect(paymentProcessor.processed[1]).to.equal(false);
        });
        it('Should return false if payment method is cash', async () => {
            sinon.stub(paymentProcessor, 'getBalance').resolves(balance);
            sinon.stub(paymentProcessor, 'getSubscription').resolves(subscriptionCashMonthly);
            const result = await paymentProcessor.processScheduledPayment(schedule);
            expect(result).to.equal(false);
        });
        it('should return false if subscription not found', async () => {
            sinon.stub(paymentProcessor, 'getBalance').resolves(balance);
            sinon.stub(paymentProcessor, 'getSubscription').resolves(null);
            const result = await paymentProcessor.processScheduledPayment(schedule);
            expect(result).to.equal(false);
        });
        it('getBalance method should return balance in schedule Item', async () => {
            const result = await paymentProcessor.getBalance(schedule);
            expect(result).to.equal(balance);
        });
        it('getBalance method should return 0 if balance not found', async () => {
            const scheduleNoBalance = new models.schedules.Item({ userId });
            const result = await paymentProcessor.getBalance(scheduleNoBalance);
            expect(result).to.equal(0);
        });
        it('processPayment should return payment item if successful', async () => {
            sinon.stub(paymentProcessor, 'getPaymentMethod').resolves(paymentMethodCredit);
            sinon.stub(paymentProcessor, 'putPaymentItem').resolves(payment);
            const result = await paymentProcessor.processPayment(userId, paymentMethodKey, balance);
            assert(result.get('itemKey'));
            assert(result.get('paymentId'));
        });
        it('_getSchema should return payment method schema only', async () => {
            const schema = paymentProcessor._getSchema(paymentMethodKey);
            expect(schema).to.equal('stripe-payment-methods');
        });
        it('should handle a processed list', async() => {
            paymentProcessor.processed = [schedule, schedule];
            sinon.stub(paymentProcessor.ses, 'send').resolves();
            const textBody = await paymentProcessor.processTreasurerEmail();
            expect(textBody).to.equal('2 Payments Processed\n\nusername\t$50\t\n\nusername\t$50\t');
        });
        it('should handle a declined payment', async () => {
            schedule.set('failure', { errorMessage: 'FAIL' });
            paymentProcessor.processed = [schedule];
            const textBody = await paymentProcessor.processTreasurerEmail();
            expect(textBody).to.equal('1 Payment Processed\n\nusername\t$50\tFAIL');
        });
        it('should ignore empty array', async () => {
            paymentProcessor.processed = [];
            const textBody = await paymentProcessor.processTreasurerEmail();
            expect(textBody).to.be.an('undefined');
        });
        it('should ignore all unprocessed', async () => {
            paymentProcessor.processed = [false, false, false];
            const textBody = await paymentProcessor.processTreasurerEmail();
            expect(textBody).to.be.an('undefined');
        });
    });
});
