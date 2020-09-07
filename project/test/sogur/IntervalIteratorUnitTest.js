contract("IntervalIteratorUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let modelDataSource;
    let mintingPointTimersManager;
    let intervalIterator;

    const owner = accounts[0];

    const catchRevert        = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    const interval = {minN: 11, maxN: 22, minR: 33, maxR: 44, alpha: 55, beta: 66};

    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        modelDataSource                  = await artifacts.require("ModelDataSourceMockup"                 ).new();
        mintingPointTimersManager                 = await artifacts.require("MintingPointTimersManagerMockup"                ).new();
        intervalIterator            = await artifacts.require("IntervalIteratorExposure"         ).new(contractAddressLocatorProxy.address);
    });

    describe("security assertion:", function() {
        before(async function() {
            await contractAddressLocatorProxy.set("IModelDataSource" , modelDataSource .address);
            await contractAddressLocatorProxy.set("IMintingPointTimersManager", mintingPointTimersManager.address);
        });
        it("function grow should abort with an error if called by a non-user", async function() {
            await catchRevert(intervalIterator.grow({from: owner}));
        });
        it("function shrink should abort with an error if called by a non-user", async function() {
            await catchRevert(intervalIterator.shrink({from: owner}));
        });
        after(async function() {
            await contractAddressLocatorProxy.set("IMonetaryModel", owner);
        });
    });

    describe("integrity assertion:", function() {
        it("function shrink should abort with an error if called before function grow", async function() {
            await mintingPointTimersManager.setRunning(true);
            await catchInvalidOpcode(intervalIterator.shrink());
        });
    });

    describe("functionality assertion:", function() {
        before(async function() {
            await modelDataSource.setInterval(interval.minN, interval.maxN, interval.minR, interval.maxR, interval.alpha, interval.beta);
        });
        it("function getCurrentInterval", async function() {
            const expected = [interval.minN, interval.maxN, interval.minR, interval.maxR, interval.alpha, interval.beta].join();
            const actual   = (await intervalIterator.getCurrentInterval()).join();
            assert(actual == expected, `expected = [${expected}], actual = [${actual}]`);
        });
        it("function getCurrentIntervalCoefs", async function() {
            const expected = [interval.alpha, interval.beta].join();
            const actual   = (await intervalIterator.getCurrentIntervalCoefs()).join();
            assert(actual == expected, `expected = [${expected}], actual = [${actual}]`);
        });
    });

    test(grow  , growFunc  );
    test(shrink, shrinkFunc);

    describe("more assertion:", function() {
        beforeEach(async function() {
            contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
                    modelDataSource                  = await artifacts.require("ModelDataSourceMockup"                 ).new();
                    mintingPointTimersManager                 = await artifacts.require("MintingPointTimersManagerMockup"                ).new();
                    intervalIterator            = await artifacts.require("IntervalIteratorExposure"         ).new(contractAddressLocatorProxy.address);
                    await contractAddressLocatorProxy.set("IModelDataSource" , modelDataSource .address);
                                await contractAddressLocatorProxy.set("IMintingPointTimersManager", mintingPointTimersManager.address);

                    await contractAddressLocatorProxy.set("IMonetaryModel", owner);
                                await modelDataSource.setInterval(interval.minN, interval.maxN, interval.minR, interval.maxR, interval.alpha, interval.beta);

        });
        it("MAX_GROW_ROW should be 94", async function() {
            assert(await intervalIterator.MAX_GROW_ROW.call() == 94, "invalid max grow");
        });
        it("function grow should fail if reached end of last interval", async function() {
            await intervalIterator.setState(94, 0);
            await catchRevert(intervalIterator.grow({from: owner}));
        });
    });

    function test(func, testFunc) {
        for (const running of [false, true]) {
            describe(`function ${func.name} with running = ${running}:`, function() {
                before(async function() {
                    await mintingPointTimersManager.setRunning(running);
                });
                for (let row = 0; row < 10; row++) {
                    for (let col = 0; col < 10; col++) {
                        const [expected_row, expected_col] = testFunc(running, row, col);
                        if (expected_row >= 0 && expected_col >= 0) {
                            it(`row = ${row}, col = ${col}`, async function() {
                                await intervalIterator.setState(row, col);
                                await func();
                                const actual_row = await intervalIterator.row();
                                const actual_col = await intervalIterator.col();
                                assert(actual_row.equals(expected_row), `expected = ${expected_row}, actual = ${actual_row}`);
                                assert(actual_col.equals(expected_col), `expected = ${expected_col}, actual = ${actual_col}`);
                            });
                        }
                    }
                }
            });
        }
    }

    async function grow  () {await intervalIterator.grow  ();}
    async function shrink() {await intervalIterator.shrink();}

    function growFunc  (running, row, col) {return col > 0 ? [row, col - 1] : [row + 1, col];}
    function shrinkFunc(running, row, col) {return running ? [row - 1, col] : [row, col + 1];}
});
