contract("ModelDataSourceUnitTest", function(accounts) {
    let modelDataSource;

    const ROW = 12;
    const VAL = 34;

    const nonOwner = accounts[1];

    const catchRevert        = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    const interval00 = {minN: 23, maxN: 24, minR: 25, maxR: 26, alpha: 27, beta: 28};
    const interval10 = {minN: 32, maxN: 42, minR: 52, maxR: 62, alpha: 72, beta: 82};

    before(async function() {
        modelDataSource = await artifacts.require("ModelDataSource").new();
    });

    describe("security assertion:", function() {
        it("function setInterval should abort with an error if called by a non-owner", async function() {
            await catchRevert(modelDataSource.setInterval(0, 0, 0, 0, 0, 0, 0, 0, {from: nonOwner}));
        });
        it("function lock should abort with an error if called by a non-owner", async function() {
            await catchRevert(modelDataSource.lock({from: nonOwner}));
        });
    });

    describe("integrity assertion:", function() {
        it("function getRequiredMintAmount should abort with an error", async function() {
            await modelDataSource.setInterval(ROW + 0, 0, 0, VAL + 1, 0, 0, 0, 0);
            await modelDataSource.setInterval(ROW + 1, 0, VAL + 0, 0, 0, 0, 0, 0);
            await catchInvalidOpcode(modelDataSource.getRequiredMintAmount(ROW));
        });
    });

    describe("functionality assertion:", function() {
        before(async function() {
            await modelDataSource.setInterval(0, 0, interval00.minN, interval00.maxN, interval00.minR, interval00.maxR, interval00.alpha, interval00.beta);
            await modelDataSource.setInterval(1, 0, interval10.minN, interval10.maxN, interval10.minR, interval10.maxR, interval10.alpha, interval10.beta);
        });
        it("function lock", async function() {
            await modelDataSource.lock();
            await catchRevert(modelDataSource.setInterval(0, 0, 0, 0, 0, 0, 0, 0));
        });
        it("function getInterval", async function() {
            const expected = [interval00.minN, interval00.maxN, interval00.minR, interval00.maxR, interval00.alpha, interval00.beta].join();
            const actual   = (await modelDataSource.getInterval(0, 0)).join();
            assert(actual == expected, `expected = [${expected}], actual = [${actual}]`);
        });
        it("function getIntervalCoefs", async function() {
            const expected = [interval00.alpha, interval00.beta].join();
            const actual   = (await modelDataSource.getIntervalCoefs(0, 0)).join();
            assert(actual == expected, `expected = [${expected}], actual = [${actual}]`);
        });
        it("function getRequiredMintAmount", async function() {
            const expected = [interval10.minN - interval00.maxN].join();
            const actual   = [await modelDataSource.getRequiredMintAmount(0)].join();
            assert(actual == expected, `expected = ${expected}, actual = ${actual}`);
        });
    });
});
