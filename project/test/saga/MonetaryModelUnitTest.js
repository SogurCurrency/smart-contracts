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

    function test(func, event, sign) {
        describe(`function ${func.name}:`, function() {
            for (let i = 0; i <= 5; i += 0.5) {
                for (let j = 0; j <= 5; j += 0.5) {
                    if ((j - i) * sign >= 0) {
                        it(`from interval ${i} to interval ${j}`, async function() {
                            await intervalIterator.setIndex(Math.floor(i));
                            await monetaryModelState.setSdrTotal(INTERVAL * i);
                            await monetaryModelState.setSgaTotal(INTERVAL * i);
                            const response = await func(INTERVAL * (j - i) * sign);
                            const index    = await intervalIterator.getIndex();
                            const sdrTotal = await monetaryModelState.getSdrTotal();
                            const sgaTotal = await monetaryModelState.getSgaTotal();
                            const expected = `{event: ${event}, index: ${Math.floor(j)}, sdrTotal: ${INTERVAL * j}, sgaTotal: ${INTERVAL * j}}`;
                            const actual   = `{event: ${response.logs[0].event}, index: ${index}, sdrTotal: ${sdrTotal}, sgaTotal: ${sgaTotal}}`;
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
