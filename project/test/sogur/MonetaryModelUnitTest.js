contract("MonetaryModelUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let monetaryModelState;
    let modelCalculator;
    let priceBandCalculator;
    let intervalIterator;
    let monetaryModel;

    const INTERVAL = 10;
    const owner    = accounts[0];

    const catchRevert = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;


    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        monetaryModelState              = await artifacts.require("MonetaryModelStateMockup"             ).new();
        modelCalculator             = await artifacts.require("ModelCalculatorMockup"            ).new();
        priceBandCalculator            = await artifacts.require("PriceBandCalculatorMockup"           ).new();
        intervalIterator            = await artifacts.require("IntervalIteratorMockup"           ).new(INTERVAL);
        monetaryModel                   = await artifacts.require("MonetaryModel"                        ).new(contractAddressLocatorProxy.address);
    });

    describe("security assertion:", function() {
        before(async function() {
            await contractAddressLocatorProxy.set("IMonetaryModelState"  , monetaryModelState  .address);
            await contractAddressLocatorProxy.set("IModelCalculator" , modelCalculator .address);
            await contractAddressLocatorProxy.set("IPriceBandCalculator", priceBandCalculator.address);
            await contractAddressLocatorProxy.set("IIntervalIterator", intervalIterator.address);
        });
        it("function buy should abort with an error if called by a non-user", async function() {
            await catchRevert(monetaryModel.buy(0, {from: owner}));
        });
        it("function sell should abort with an error if called by a non-user", async function() {
            await catchRevert(monetaryModel.sell(0, {from: owner}));
        });
        after(async function() {
            await contractAddressLocatorProxy.set("ITransactionManager", owner);
        });
    });

    test(buy , "MonetaryModelBuyCompleted" , +1);
    test(sell, "MonetaryModelSellCompleted", -1);

    describe("MIN_RR and MAX_RR assertion:", function() {
        beforeEach(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        monetaryModelState              = await artifacts.require("MonetaryModelStateMockup"             ).new();
        modelCalculator             = await artifacts.require("ModelCalculatorMockup"            ).new();
        priceBandCalculator            = await artifacts.require("PriceBandCalculatorMockup"           ).new();
        intervalIterator            = await artifacts.require("IntervalIteratorMockup"           ).new(INTERVAL);
        monetaryModel                   = await artifacts.require("MonetaryModel"                        ).new(contractAddressLocatorProxy.address);
        await contractAddressLocatorProxy.set("IMonetaryModelState"  , monetaryModelState  .address);
        await contractAddressLocatorProxy.set("IModelCalculator" , modelCalculator .address);
        await contractAddressLocatorProxy.set("IPriceBandCalculator", priceBandCalculator.address);
        await contractAddressLocatorProxy.set("IIntervalIterator", intervalIterator.address);
        await contractAddressLocatorProxy.set("ITransactionManager", owner);
        });

         it("MIN_RR and MAX_RR should be valid", async function() {
            assert((await monetaryModel.MIN_RR.call()).toFixed() ==  BigInt("1000000000000000000000000000000000"));
            assert((await monetaryModel.MAX_RR.call()).toFixed() ==  BigInt("10000000000000000000000000000000000"));
         });

        it("buy should fail if reserveRatio is below MIN_RR", async function() {
            await intervalIterator.setCoefsReturnValues(0,0);
            await catchInvalidOpcode(monetaryModel.buy(10));
        });

        it("buy should fail if reserveRatio is greater then MAX_RR", async function() {
            await intervalIterator.setCoefsReturnValues( BigInt("10000000000000000000000000000000001") ,0);
            await catchInvalidOpcode(monetaryModel.buy(10));
        });

        it("sell should fail if reserveRatio is below MIN_RR", async function() {
            await intervalIterator.setCoefsReturnValues(0,0);
            await catchInvalidOpcode(monetaryModel.sell(10));
        });

        it("sell should fail if reserveRatio is greater then MAX_RR", async function() {
            await intervalIterator.setCoefsReturnValues( BigInt("10000000000000000000000000000000001") ,0);
            await catchInvalidOpcode(monetaryModel.sell(10));
        });
    });



    function test(func, event, sign) {
        describe(`function ${func.name}:`, function() {
            for (let i = 0; i <= 5; i += 0.5) {
                for (let j = 0; j <= 5; j += 0.5) {
                    if ((j - i) * sign >= 0) {
                        it(`from interval ${i} to interval ${j}`, async function() {
                            await intervalIterator.setIndex(Math.floor(i));
                            await monetaryModelState.setSdrTotal(INTERVAL * i);
                            await monetaryModelState.setSgrTotal(INTERVAL * i);
                            const response = await func(INTERVAL * (j - i) * sign);
                            const index    = await intervalIterator.getIndex();
                            const sdrTotal = await monetaryModelState.getSdrTotal();
                            const sgrTotal = await monetaryModelState.getSgrTotal();
                            const expected = `{event: ${event}, index: ${Math.floor(j)}, sdrTotal: ${INTERVAL * j}, sgrTotal: ${INTERVAL * j}}`;
                            const actual   = `{event: ${response.logs[0].event}, index: ${index}, sdrTotal: ${sdrTotal}, sgrTotal: ${sgrTotal}}`;
                            assert(actual == expected, `expected = ${expected}, actual = ${actual}`);
                        });
                    }
                }
            }
        });
    }

    async function buy (amount) {return await monetaryModel.buy (amount);}
    async function sell(amount) {return await monetaryModel.sell(amount);}
});
