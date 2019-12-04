contract("RateApproverUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let rateApprover;
    let MAX_RESOLUTION;
    let ILLEGAL_VAL;

    const MAX_HIGH_RATE_N   = 8000;
    const MAX_HIGH_RATE_D   = 2000;
    const MIN_LOW_RATE_N   = 3000;
    const MIN_LOW_RATE_D   = 3000;

    const HIGH_RATE_N   = 9000;
    const HIGH_RATE_D   = 3000;
    const LOW_RATE_N   = 4000;
    const LOW_RATE_D   = 2000;

    const owner = accounts[0];
    const nonOwner = accounts[1];

    const assertEqual = require("../utilities.js").assertEqual;
    const catchRevert = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    beforeEach(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        rateApprover        = await artifacts.require("RateApprover"             ).new(contractAddressLocatorProxy.address);
        MAX_RESOLUTION              = await rateApprover.MAX_RESOLUTION();
        ILLEGAL_VAL                 = MAX_RESOLUTION.plus(1);
    });

    describe("constructor:", function() {
        it("max resolution", async function() {
            assertEqual( rateApprover.MAX_RESOLUTION(), "0x10000000000000000");
        });
        it("rate bounds", async function() {
            assert.equal(0, await rateApprover.maxHighRateN());
            assert.equal(0, await rateApprover.maxHighRateD());
            assert.equal(0, await rateApprover.minLowRateN());
            assert.equal(0, await rateApprover.minLowRateD());
        });
    });

    describe("function setRateBounds:", function() {
        it("should abort with an error if called by a non-owner", async function() {
            await catchRevert(rateApprover.setRateBounds(1, MAX_HIGH_RATE_N, MAX_HIGH_RATE_D, MIN_LOW_RATE_N, MIN_LOW_RATE_D, {from: nonOwner}));
        });
        it("should abort with an error if max high rate is smaller than min low rate", async function() {
            await catchRevert(rateApprover.setRateBounds(1, MAX_HIGH_RATE_N + 0, MAX_HIGH_RATE_D + 0, MAX_HIGH_RATE_N + 1, MAX_HIGH_RATE_D + 0));
        });
        it("should abort with an error if any input value is out of range", async function() {
            await catchRevert(rateApprover.setRateBounds(1, 0          , MAX_HIGH_RATE_D , MIN_LOW_RATE_N , MIN_LOW_RATE_D ));
            await catchRevert(rateApprover.setRateBounds(1, ILLEGAL_VAL, MAX_HIGH_RATE_D , MIN_LOW_RATE_N , MIN_LOW_RATE_D ));
            await catchRevert(rateApprover.setRateBounds(1, MAX_HIGH_RATE_N , 0          , MIN_LOW_RATE_N , MIN_LOW_RATE_D ));
            await catchRevert(rateApprover.setRateBounds(1, MAX_HIGH_RATE_N , ILLEGAL_VAL, MIN_LOW_RATE_N , MIN_LOW_RATE_D ));
            await catchRevert(rateApprover.setRateBounds(1, MAX_HIGH_RATE_N , MAX_HIGH_RATE_D , 0          , MIN_LOW_RATE_D ));
            await catchRevert(rateApprover.setRateBounds(1, MAX_HIGH_RATE_N , MAX_HIGH_RATE_D , ILLEGAL_VAL, MIN_LOW_RATE_D ));
            await catchRevert(rateApprover.setRateBounds(1, MAX_HIGH_RATE_N , MAX_HIGH_RATE_D , MIN_LOW_RATE_N , 0          ));
            await catchRevert(rateApprover.setRateBounds(1, MAX_HIGH_RATE_N , MAX_HIGH_RATE_D , MIN_LOW_RATE_N , ILLEGAL_VAL));
        });
        it("should save and publish RateBoundsSaved if all input values are within range", async function() {
            const response = await rateApprover.setRateBounds(1, MAX_HIGH_RATE_N, MAX_HIGH_RATE_D, MIN_LOW_RATE_N, MIN_LOW_RATE_D);

            await assertEqual(rateApprover.sequenceNum(), 1);
            await assertEqual(rateApprover.maxHighRateN(), MAX_HIGH_RATE_N);
            await assertEqual(rateApprover.maxHighRateD(), MAX_HIGH_RATE_D);
            await assertEqual(rateApprover.minLowRateN(), MIN_LOW_RATE_N);
            await assertEqual(rateApprover.minLowRateD(), MIN_LOW_RATE_D);

            assert.equal(response.logs[0].event, "RateBoundsSaved");
            assert.equal(response.logs[0].args._maxHighRateN , MAX_HIGH_RATE_N);
            assert.equal(response.logs[0].args._maxHighRateD , MAX_HIGH_RATE_D);
            assert.equal(response.logs[0].args._minLowRateN , MIN_LOW_RATE_N);
            assert.equal(response.logs[0].args._minLowRateD ,MIN_LOW_RATE_D);
        });

        it("should not save and publish RateBoundsNotSaved if sequence num is not valid", async function() {
            await rateApprover.setRateBounds(1, MAX_HIGH_RATE_N, MAX_HIGH_RATE_D, MIN_LOW_RATE_N, MIN_LOW_RATE_D);
            const response = await rateApprover.setRateBounds(1, 2, 1, 1, 2);

            await assertEqual(rateApprover.sequenceNum(), 1);
            await assertEqual(rateApprover.maxHighRateN(), MAX_HIGH_RATE_N);
            await assertEqual(rateApprover.maxHighRateD(), MAX_HIGH_RATE_D);
            await assertEqual(rateApprover.minLowRateN(), MIN_LOW_RATE_N);
            await assertEqual(rateApprover.minLowRateD(), MIN_LOW_RATE_D);

            assert.equal(response.logs[0].event, "RateBoundsNotSaved");
            assert.equal(response.logs[0].args._maxHighRateN , 2);
            assert.equal(response.logs[0].args._maxHighRateD , 1);
            assert.equal(response.logs[0].args._minLowRateN , 1);
            assert.equal(response.logs[0].args._minLowRateD ,2);
        });
    });

    describe("function approveRate:", function() {
        const validETHConverterSource = accounts[4];
        beforeEach(async function() {
            await contractAddressLocatorProxy.set("IETHConverter", validETHConverterSource);
        });

        it("should abort with an error if called before setting rate bounds", async function() {
            await catchInvalidOpcode(rateApprover.approveRate(HIGH_RATE_N, HIGH_RATE_D, LOW_RATE_N, LOW_RATE_D, {from: validETHConverterSource}));
        });
        it("should abort with an error if called from contract other than ETH converter", async function() {
            await rateApprover.setRateBounds(1, MAX_HIGH_RATE_N, MAX_HIGH_RATE_D, MIN_LOW_RATE_N, MIN_LOW_RATE_D);
            await catchRevert(rateApprover.approveRate(HIGH_RATE_N, HIGH_RATE_D, LOW_RATE_N, LOW_RATE_D));
        });

        it("should return false if high rate is higher than max high rate", async function() {
            await rateApprover.setRateBounds(1, MAX_HIGH_RATE_N, MAX_HIGH_RATE_D, MIN_LOW_RATE_N, MIN_LOW_RATE_D);
            const [success, reason] = await rateApprover.approveRate(MAX_HIGH_RATE_N + 1, MAX_HIGH_RATE_D, LOW_RATE_N, LOW_RATE_D, {from: validETHConverterSource});
            assert.equal(success, false);
            assert.equal(reason , "high rate is higher than max high rate");
        });

        it("should return false if low rate is lower than min low rate", async function() {
            await rateApprover.setRateBounds(1, MAX_HIGH_RATE_N, MAX_HIGH_RATE_D, MIN_LOW_RATE_N, MIN_LOW_RATE_D);
            const [success, reason] = await rateApprover.approveRate(HIGH_RATE_N, HIGH_RATE_D, MIN_LOW_RATE_N - 1, MIN_LOW_RATE_D, {from: validETHConverterSource});
            assert.equal(success, false);
            assert.equal(reason , "low rate is lower than min low rate");
        });

        it("should return false if low rate is higher than high rate", async function() {
            await rateApprover.setRateBounds(1, 100, 2, 1, 1);
            const [success, reason] = await rateApprover.approveRate(4, 2, 6, 2, {from: validETHConverterSource});
            assert.equal(success, false);
            assert.equal(reason , "high rate is smaller than low rate");
        });

        it("should return true if all ok", async function() {
            await rateApprover.setRateBounds(1, MAX_HIGH_RATE_N, MAX_HIGH_RATE_D, MIN_LOW_RATE_N, MIN_LOW_RATE_D);
            const [success, reason] = await rateApprover.approveRate(HIGH_RATE_N, HIGH_RATE_D, LOW_RATE_N, LOW_RATE_D, {from: validETHConverterSource});
            assert.equal(success, true);
            assert.equal(reason , "");
        });
    });
});
