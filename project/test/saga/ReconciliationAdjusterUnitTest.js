contract("ReconciliationAdjusterUnitTest", function(accounts) {
    let reconciliationAdjuster;
    let MAX_RESOLUTION;
    let ILLEGAL_VAL;

    const SEQUENCE_NUM = 1000;
    const FACTOR_N     = 2000;
    const FACTOR_D     = 3000;
    const AMOUNT       = 4000;

    const nonOwner = accounts[1];

    const assertEqual = require("../utilities.js").assertEqual;
    const catchRevert = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    before(async function() {
        reconciliationAdjuster = await artifacts.require("ReconciliationAdjuster").new();
        MAX_RESOLUTION    = await reconciliationAdjuster.MAX_RESOLUTION();
        ILLEGAL_VAL       = MAX_RESOLUTION.plus(1);
    });

    describe("security assertion:", function() {
        it("function setFactor should abort with an error if called by a non-owner", async function() {
            await catchRevert(reconciliationAdjuster.setFactor(SEQUENCE_NUM, FACTOR_N, FACTOR_D, {from: nonOwner}));
        });
    });

    describe("functionality assertion:", function() {
        it("function setFactor should abort with an error if any input value is out of range", async function() {
            await catchRevert(reconciliationAdjuster.setFactor(SEQUENCE_NUM, 0          , FACTOR_D   ));
            await catchRevert(reconciliationAdjuster.setFactor(SEQUENCE_NUM, ILLEGAL_VAL, FACTOR_D   ));
            await catchRevert(reconciliationAdjuster.setFactor(SEQUENCE_NUM, FACTOR_N   , 0          ));
            await catchRevert(reconciliationAdjuster.setFactor(SEQUENCE_NUM, FACTOR_N   , ILLEGAL_VAL));
        });
        it("function adjustBuy should abort with an error if called before factor set", async function() {
            await catchInvalidOpcode(reconciliationAdjuster.adjustBuy(AMOUNT));
        });
        it("function adjustSell should abort with an error if called before factor set", async function() {
            await catchInvalidOpcode(reconciliationAdjuster.adjustSell(AMOUNT));
        });
        it("function setFactor should complete successfully if all input values are within range", async function() {
            await setFactor(SEQUENCE_NUM, FACTOR_N + 0, FACTOR_D + 0, "FactorSaved"   );
            await setFactor(SEQUENCE_NUM, FACTOR_N + 1, FACTOR_D + 1, "FactorNotSaved");
            await assertEqual(reconciliationAdjuster.factorN(), FACTOR_N + 0);
            await assertEqual(reconciliationAdjuster.factorD(), FACTOR_D + 0);
        });
    });

    test(adjustBuy , adjustBuyFunc );
    test(adjustSell, adjustSellFunc);

    async function setFactor(sequenceNum, factorN, factorD, eventName) {
        const response = await reconciliationAdjuster.setFactor(sequenceNum, factorN, factorD);
        assert.equal(response.logs[0].args._factorN.toString(), factorN.toString());
        assert.equal(response.logs[0].args._factorD.toString(), factorD.toString());
        assert.equal(response.logs[0].event, eventName);
    }

    function test(func, testFunc) {
        describe(`function ${func.name}:`, function() {
            for (let factorN = 1; factorN <= 10; factorN++) {
                for (let factorD = 1; factorD <= 10; factorD++) {
                    it(`factorN = ${factorN}, factorD = ${factorD}`, async function() {
                        await reconciliationAdjuster.setFactor(Date.now(), factorN, factorD);
                        await assertEqual(func(AMOUNT), testFunc(AMOUNT, factorN, factorD));
                    });
                }
            }
        });
    }

    async function adjustBuy (sdrAmount) {return await reconciliationAdjuster.adjustBuy (sdrAmount);}
    async function adjustSell(sdrAmount) {return await reconciliationAdjuster.adjustSell(sdrAmount);}

    function adjustBuyFunc (sdrAmount, factorN, factorD) {return Math.floor(sdrAmount * factorD / factorN);}
    function adjustSellFunc(sdrAmount, factorN, factorD) {return Math.floor(sdrAmount * factorN / factorD);}
});
