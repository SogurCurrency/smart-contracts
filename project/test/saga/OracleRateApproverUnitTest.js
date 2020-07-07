/*

*/
contract("OracleRateApproverUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let rateApprover;
    let aggregatorInterfaceMockup;

    let MILLION = 1000000;
    const RATE_N   = 15718557;
    const RATE_D   = 100000;

    const VALID_RATE_DEVIATION_THRESHOLD   = 5000 ;
    const ORACLE_RATE_PRECISION = 100000000;

    const FIRST_SEQUENCE_NUM = 2;

    const owner = accounts[0];
    const nonOwner = accounts[1];
    const validETHConverterSource = accounts[4];

    const nullAddress        = require("../utilities.js").address(0);

    const assertEqual = require("../utilities.js").assertEqual;
    const catchRevert = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    beforeEach(async function() {
        aggregatorInterfaceMockup        = await artifacts.require("AggregatorInterfaceMockup"       ).new();
        await aggregatorInterfaceMockup.setLatestAnswer(RATE_N);
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        rateApprover        = await artifacts.require("OracleRateApprover"             ).new(contractAddressLocatorProxy.address, aggregatorInterfaceMockup.address, VALID_RATE_DEVIATION_THRESHOLD);
        await contractAddressLocatorProxy.set("IETHConverter", validETHConverterSource);
    });

    describe("constructor:", function() {
        it("should fail if _oracleRateAggregatorAddress is null", async function() {
            await catchRevert(artifacts.require("OracleRateApprover"             ).new(contractAddressLocatorProxy.address, nullAddress, VALID_RATE_DEVIATION_THRESHOLD));
        });
        it("should fail if _rateDeviationThreshold is greater than million", async function() {
            await catchRevert(artifacts.require("OracleRateApprover"             ).new(contractAddressLocatorProxy.address, aggregatorInterfaceMockup.address, MILLION + 1));
        });
        it("MILLION", async function() {
            assert.equal(MILLION, await rateApprover.MILLION());
        });
        it("ORACLE_RATE_PRECISION", async function() {
            assert.equal(ORACLE_RATE_PRECISION, await rateApprover.ORACLE_RATE_PRECISION());
        });
        it("rateDeviationThreshold", async function() {
            assert.equal(VALID_RATE_DEVIATION_THRESHOLD, await rateApprover.rateDeviationThreshold());
        });
        it("isApproveAllRates", async function() {
            assert.equal(false, await rateApprover.isApproveAllRates());
        });
        it("oracleRateAggregatorSequenceNum", async function() {
            assert.equal(1, await rateApprover.oracleRateAggregatorSequenceNum());
        });
        it("rateDeviationThresholdSequenceNum", async function() {
            assert.equal(1, await rateApprover.rateDeviationThresholdSequenceNum());
        });
        it("isApproveAllRatesSequenceNum", async function() {
            assert.equal(0, await rateApprover.isApproveAllRatesSequenceNum());
        });
    });

    describe("function setOracleRateAggregator:", function() {
        it("should abort with an error if called by a non-owner", async function() {
            await catchRevert(rateApprover.setOracleRateAggregator(FIRST_SEQUENCE_NUM, aggregatorInterfaceMockup.address, {from: nonOwner}));
        });
        it("should abort with an error if zero address", async function() {
            await catchRevert(rateApprover.setOracleRateAggregator(FIRST_SEQUENCE_NUM, nullAddress), "invalid _oracleRateAggregatorAddress");
        });
        it("should save and publish the right event", async function() {
            const expectedAddressSaved = accounts[3];
            const expectedAddressNotSaved = accounts[4];

            let response = await rateApprover.setOracleRateAggregator(FIRST_SEQUENCE_NUM, expectedAddressSaved);
            assert.equal(response.logs[0].event, "OracleRateAggregatorSaved");
            assert.equal(response.logs[0].args._oracleRateAggregatorAddress , expectedAddressSaved);

            response = await rateApprover.setOracleRateAggregator(FIRST_SEQUENCE_NUM, expectedAddressNotSaved);
            assert.equal(response.logs[0].event, "OracleRateAggregatorNotSaved");
            assert.equal(response.logs[0].args._oracleRateAggregatorAddress , expectedAddressNotSaved);
        });
    });

    describe("function setRateDeviationThreshold:", function() {
        it("should abort with an error if called by a non-owner", async function() {
            await catchRevert(rateApprover.setRateDeviationThreshold(FIRST_SEQUENCE_NUM, VALID_RATE_DEVIATION_THRESHOLD, {from: nonOwner}));
        });
        it("should abort with an error if rate deviation threshold is greater then million", async function() {
            await catchRevert(rateApprover.setRateDeviationThreshold(FIRST_SEQUENCE_NUM, MILLION + 1));
        });
        it("should save and publish the right event", async function() {
            const rateDeviationThreshold = 7777;
            let response = await rateApprover.setRateDeviationThreshold(FIRST_SEQUENCE_NUM, rateDeviationThreshold);
            await assertEqual(rateApprover.rateDeviationThreshold(), rateDeviationThreshold);
            assert.equal(response.logs[0].event, "RateDeviationThresholdSaved");
            assert.equal(response.logs[0].args._rateDeviationThreshold , rateDeviationThreshold);

            response = await rateApprover.setRateDeviationThreshold(FIRST_SEQUENCE_NUM, rateDeviationThreshold + 1);
            await assertEqual(rateApprover.rateDeviationThreshold(), rateDeviationThreshold);
            assert.equal(response.logs[0].event, "RateDeviationThresholdNotSaved");
            assert.equal(response.logs[0].args._rateDeviationThreshold , rateDeviationThreshold + 1);
        });
    });

    describe("function setIsApproveAllRates:", function() {
        it("should abort with an error if called by a non-owner", async function() {
            await catchRevert(rateApprover.setIsApproveAllRates(FIRST_SEQUENCE_NUM, true, {from: nonOwner}));
        });
        it("should save and publish the right event", async function() {
            let response = await rateApprover.setIsApproveAllRates(FIRST_SEQUENCE_NUM, true);
            assert.isTrue(await rateApprover.isApproveAllRates());
            assert.equal(response.logs[0].event, "ApproveAllRatesSaved");
            assert.equal(response.logs[0].args._isApproveAllRates , true);

            response = await rateApprover.setIsApproveAllRates(FIRST_SEQUENCE_NUM, false);
            assert.isTrue(await rateApprover.isApproveAllRates());
            assert.equal(response.logs[0].event, "ApproveAllRatesNotSaved");
            assert.equal(response.logs[0].args._isApproveAllRates , false);
        });
    });

    describe("function getOracleLatestRate:", function() {
        it("should abort with an error if latest answer is lower or equal 0", async function() {
            await aggregatorInterfaceMockup.setLatestAnswer(-1);
            await catchInvalidOpcode(rateApprover.approveHighRate(RATE_N, RATE_D, {from: validETHConverterSource}));
            await catchInvalidOpcode(rateApprover.approveLowRate(RATE_N, RATE_D, {from: validETHConverterSource}));
            await aggregatorInterfaceMockup.setLatestAnswer(0);
            await catchInvalidOpcode(rateApprover.approveHighRate(RATE_N, RATE_D, {from: validETHConverterSource}));
            await catchInvalidOpcode(rateApprover.approveLowRate(RATE_N, RATE_D, {from: validETHConverterSource}));
        });
    });

    describe("functions approveRate:", function() {
        it("should abort with an error if called from contract other than ETH converter", async function() {
            await rateApprover.setRateDeviationThreshold(FIRST_SEQUENCE_NUM, VALID_RATE_DEVIATION_THRESHOLD);
            await rateApprover.setOracleRateAggregator(FIRST_SEQUENCE_NUM, aggregatorInterfaceMockup.address);
            await catchRevert(rateApprover.approveHighRate(RATE_N, RATE_D));
            await catchRevert(rateApprover.approveLowRate(RATE_N, RATE_D));
        });

        it("should abort with an error if called with 0 rateD or rateN", async function() {
            await rateApprover.setRateDeviationThreshold(FIRST_SEQUENCE_NUM, VALID_RATE_DEVIATION_THRESHOLD);
            await rateApprover.setOracleRateAggregator(FIRST_SEQUENCE_NUM, aggregatorInterfaceMockup.address);
            await rateApprover.approveHighRate(1, 1, {from: validETHConverterSource});
            await rateApprover.approveLowRate(1, 1, {from: validETHConverterSource});
            await catchInvalidOpcode(rateApprover.approveHighRate(0, 0, {from: validETHConverterSource}));
            await catchInvalidOpcode(rateApprover.approveHighRate(1, 0, {from: validETHConverterSource}));
            await catchInvalidOpcode(rateApprover.approveLowRate(0, 0, {from: validETHConverterSource}));
            await catchInvalidOpcode(rateApprover.approveLowRate(1, 0, {from: validETHConverterSource}));
        });

         it("should return true if isApproveAllRates set to true", async function() {
            await rateApprover.setIsApproveAllRates(FIRST_SEQUENCE_NUM, true);
            assert.isTrue(await rateApprover.approveHighRate(1, 1, {from: validETHConverterSource}));
            assert.isTrue(await rateApprover.approveLowRate(1, 1, {from: validETHConverterSource}));
         });


        const approveRateTestValues = [
        {
            'name' : "pass",
            'oracleLatestRate': ORACLE_RATE_PRECISION * 160,
            'success': true
        },
        {
            'name' : "pass edge high",
            'oracleLatestRate': ORACLE_RATE_PRECISION * 165,
            'success': true
        },
        {
            'name' : "pass edge low",
            'oracleLatestRate': ORACLE_RATE_PRECISION * (14971/100),
            'success': true
        },
        {
            'name' : "fail edge low",
            'oracleLatestRate': ORACLE_RATE_PRECISION * (1655/10),
            'success': false
        },
        {
            'name' : "fail edge high",
            'oracleLatestRate': ORACLE_RATE_PRECISION * (1493/10),
            'success': false
        },
        {
            'name' : "fail low",
            'oracleLatestRate': ORACLE_RATE_PRECISION * (1655),
            'success': false
        },
        {
            'name' : "fail high",
            'oracleLatestRate': ORACLE_RATE_PRECISION * (1493/100),
            'success': false
        },
        {
            'name' : "extreme values overflow 1",
            'oracleLatestRate': ORACLE_RATE_PRECISION * 160,
            'rateN': 18446744073709551616,
            'rateD': 1,
            'rateDeviationThreshold' : 1,
            'success': false
        },
        {
            'name' : "extreme values overflow 2",
            'oracleLatestRate': ORACLE_RATE_PRECISION * 160,
            'rateN': 1,
            'rateD': 18446744073709551616,
            'rateDeviationThreshold' : MILLION - 1,
            'success': false
        },
        {
            'name' : "extreme values overflow 3",
            'oracleLatestRate': ORACLE_RATE_PRECISION,
            'rateN': 18446744073709551616,
            'rateD': 18446744073709551616,
            'rateDeviationThreshold' : 1,
            'success': true
        }
        ];

        for (let j = 0; j < approveRateTestValues.length; j++) {

        it(`approve rate combinations ${approveRateTestValues[j].name}`, async function() {
            const getOracleLatestRate = approveRateTestValues[j].oracleLatestRate;
            const expectedSuccess = approveRateTestValues[j].success;

            const overrideRateN = approveRateTestValues[j].rateN;
            const overrideRateD = approveRateTestValues[j].rateD;
            const overrideRateDeviationThreshold = approveRateTestValues[j].rateDeviationThreshold;

            let _rateD;
            if (overrideRateD)
            _rateD = overrideRateD;
            else
            _rateD = 100000;

            let _rateN;
            if (overrideRateN)
            _rateN = overrideRateN;
            else
            _rateN = 15718557;

            let rateDeviationThreshold;
            if (overrideRateDeviationThreshold)
            rateDeviationThreshold = overrideRateDeviationThreshold;
            else
            rateDeviationThreshold = 50000;

            await rateApprover.setRateDeviationThreshold(FIRST_SEQUENCE_NUM, rateDeviationThreshold);
            await aggregatorInterfaceMockup.setLatestAnswer(getOracleLatestRate);

            const approveHighRateActualSuccess = await rateApprover.approveHighRate(_rateN, _rateD, {from: validETHConverterSource});
            assert.equal(approveHighRateActualSuccess, expectedSuccess);

            const approveLowRateActualSuccess = await rateApprover.approveLowRate(_rateN, _rateD, {from: validETHConverterSource});
            assert.equal(approveLowRateActualSuccess, expectedSuccess);

        });}
    });
});
