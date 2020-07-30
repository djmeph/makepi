process.env.AWS_REGION = 'us-east-1';

const sinon = require('sinon');
const { expect, assert } = require('chai');
const PaymentScheduler = require('../../services/payment-scheduler');
const fakeLogger = require('../util/fakeLogger');
const models = require('../../models');
const mocks = require('../util/mocks');
const { userId } = mocks;
let subscriptionCreditMonthly,
    subscriptionCashMonthly,
    plan,
    schedule,
    subscriptionFifteenthPaymentDate;

describe('UnitTests::', () => {
    describe('PaymentScheduler::', () => {
        beforeEach(() => {
            subscriptionCreditMonthly = new models.subscriptions.Item(mocks.subscriptionCreditMonthly);
            subscriptionCashMonthly = new models.subscriptions.Item(mocks.subscriptionCashMonthly);
            plan = new models.plans.Item(mocks.plan);
            schedule = new models.schedules.Item(mocks.schedule);
            subscriptionFifteenthPaymentDate = new models.subscriptions.Item(mocks.subscriptionFifteenthPaymentDate);
            paymentScheduler = new PaymentScheduler({
                now: '2020-04-11T13:00:00.000Z',
                log: fakeLogger,
                timezone: 'America/Detroit'
            });
        });
        it('Should return truthy if payment scheduling succeeds', async () => {
            sinon.stub(paymentScheduler, 'getSchedulesByUserIdAndStatus').resolves([]);
            sinon.stub(paymentScheduler, 'getPlan').resolves(plan);
            sinon.stub(paymentScheduler, 'saveScheduleItem').resolves(schedule);
            const result = await paymentScheduler.processSubscription(userId, subscriptionCreditMonthly);
            assert(result);
        });
        it('Should return false if payment scheduling fails', async () => {
            sinon.stub(paymentScheduler, 'getSchedulesByUserIdAndStatus').rejects();
            const result = await paymentScheduler.processSubscription(userId, subscriptionCreditMonthly);
            expect(result).to.equal(false);
        });
        it('Should pass and fail on a per subscription item basis', async () => {
            paymentScheduler.subscriptions = [subscriptionCreditMonthly, subscriptionCreditMonthly];
            sinon.stub(paymentScheduler, 'getPlan').resolves(plan);
            sinon.stub(paymentScheduler, 'saveScheduleItem').resolves(schedule);
            const getSchedulesByUserIdAndStatusStub = sinon.stub(paymentScheduler, 'getSchedulesByUserIdAndStatus');
            getSchedulesByUserIdAndStatusStub.onCall(0).resolves([]);
            getSchedulesByUserIdAndStatusStub.onCall(1).rejects();
            await paymentScheduler.processSubscriptions();
            assert(paymentScheduler.processed[0]);
            expect(paymentScheduler.processed[1]).to.equal(false);
        });
        it('Should return false if cash is the selected payment method', async () => {
            const result = await paymentScheduler.processSubscription(userId, subscriptionCashMonthly);
            expect(result).to.equal(false);
        });
        it('should return false if unpaid schedule item found', async () => {
            sinon.stub(paymentScheduler, 'getSchedulesByUserIdAndStatus').resolves([schedule]);
            const result = await paymentScheduler.processSubscription(userId, subscriptionCreditMonthly);
            expect(result).to.equal(false);
        });
        it('Should calculate date as the 1st of next month in Detroit time because now is after this month\'s paymentDay', async () => {
            sinon.stub(paymentScheduler, 'getSchedulesByUserIdAndStatus').resolves([]);
            sinon.stub(paymentScheduler, 'getPlan').resolves(plan);
            sinon.stub(paymentScheduler, 'saveScheduleItem').resolves(schedule);
            const result = await paymentScheduler.processSubscription(userId, subscriptionCreditMonthly);
            expect(result).to.equal('2020-05-01T04:00:00.000Z');
        });
        it('Should calculate date as the 15th of this month in Detroit time because now is before this month\'s paymentDay', async () => {
            sinon.stub(paymentScheduler, 'getSchedulesByUserIdAndStatus').resolves([]);
            sinon.stub(paymentScheduler, 'getPlan').resolves(plan);
            sinon.stub(paymentScheduler, 'saveScheduleItem').resolves(schedule);
            const result = await paymentScheduler.processSubscription(userId, subscriptionFifteenthPaymentDate);
            expect(result).to.equal('2020-05-15T04:00:00.000Z');
        });
    });
});
