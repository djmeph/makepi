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
    balance,
} = mocks;
let schedule,
    subscriptionCashMonthly,
    subscriptionCreditMonthly,
    payment,
    paymentMethodCredit;

describe('UnitTests::', () => {
    describe('PaymentProcessor::', () => {
        let paymentProcessor;
        before(() => {
            sinon.stub(PaymentProcessor.prototype, 'charge').callsFake(async () => ({ amount: balance, metadata: {} }));
            sinon.stub(PaymentProcessor.prototype, 'putPaymentItem').callsFake(async () => payment);
            sinon.stub(PaymentProcessor.prototype, 'updateScheduledItem');
        });
        beforeEach(() => {
            schedule = new models.schedules.Item(mocks.schedule);
            subscriptionCashMonthly = new models.subscriptions.Item(mocks.subscriptionCashMonthly);
            subscriptionCreditMonthly = new models.subscriptions.Item(mocks.subscriptionCreditMonthly);
            payment = new models.payments.Item(mocks.payment);
            paymentMethodCredit = new models.stripePaymentMethods.Item(mocks.paymentMethodCredit);
            paymentProcessor = new PaymentProcessor({
                log: fakeLogger
            });
        });
        it('Should return true if payment processing succeeds', async () => {
            sinon.stub(payment, 'create').callsFake(async () => payment);
            sinon.stub(schedule, 'update').callsFake(async () => schedule);
            sinon.stub(paymentProcessor, 'getBalance').callsFake(async () => balance);
            sinon.stub(paymentProcessor, 'getSubscription').callsFake(async () => subscriptionCreditMonthly);
            sinon.stub(paymentProcessor, 'getPaymentMethod').callsFake(async () => paymentMethodCredit);
            sinon.stub(paymentProcessor, 'paymentSuccessEmail');
            const result = await paymentProcessor.processScheduledPayment(schedule);
            expect(result).to.equal(true);
        });
        it('Should return false if payment processing fails', async () => {
            sinon.stub(paymentProcessor, 'getBalance').callsFake(async () => balance);
            sinon.stub(paymentProcessor, 'getSubscription').rejects();
            const result = await paymentProcessor.processScheduledPayment(schedule);
            expect(result).to.equal(false);
        });
        it('Should pass and fail on a per schedule item basis', async () => {
            paymentProcessor.schedules = [schedule, schedule];
            sinon.stub(payment, 'create').callsFake(async () => payment);
            sinon.stub(schedule, 'update').callsFake(async () => schedule);
            sinon.stub(paymentProcessor, 'getBalance').callsFake(async () => balance);
            sinon.stub(paymentProcessor, 'getPaymentMethod').callsFake(async () => paymentMethodCredit);
            sinon.stub(paymentProcessor, 'paymentSuccessEmail');
            const getSubscriptionStub = sinon.stub(paymentProcessor, 'getSubscription');
            getSubscriptionStub.onCall(0).callsFake(async () => subscriptionCreditMonthly);
            getSubscriptionStub.onCall(1).rejects();
            await paymentProcessor.processScheduledPayments();
            expect(paymentProcessor.processed[0]).to.equal(true);
            expect(paymentProcessor.processed[1]).to.equal(false);
        });
        it('Should return false if payment method is cash', async () => {
            sinon.stub(paymentProcessor, 'getBalance').callsFake(async () => balance);
            sinon.stub(paymentProcessor, 'getSubscription').callsFake(async () => subscriptionCashMonthly);
            const result = await paymentProcessor.processScheduledPayment(schedule);
            expect(result).to.equal(false);
        });
        it('should return false if subscription not found', async () => {
            sinon.stub(paymentProcessor, 'getBalance').callsFake(async () => balance);
            sinon.stub(paymentProcessor, 'getSubscription').callsFake(async () => null);
            const result = await paymentProcessor.processScheduledPayment(schedule);
            expect(result).to.equal(false);
        });
        it('getBalance method should return balance in schedule Item', async () => {
            const result = await paymentProcessor.getBalance(schedule);
            expect(result).to.equal(balance);
        });
        it('getBalance method should return 0 if balance not found', async () => {
            const scheduleNoBalance = new models.schedules.Item({
                userId
            });
            const result = await paymentProcessor.getBalance(scheduleNoBalance);
            expect(result).to.equal(0);
        });
        it('processPayment should return payment item if successful', async () => {
            sinon.stub(paymentProcessor, 'getPaymentMethod').callsFake(async () => paymentMethodCredit);
            const payment = await paymentProcessor.processPayment(userId, paymentMethodKey, balance);
            assert(payment.get('itemKey'));
            assert(payment.get('paymentId'));
        });
        it('_getSchema should return payment method schema only', async () => {
            const schema = paymentProcessor._getSchema(paymentMethodKey);
            expect(schema).to.equal('stripe-payment-methods');
        });
    });
});
