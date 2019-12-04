contract("SGNConversionManagerUnitTest", function(accounts) {
    let sgnConversionManager;
    let MAX_AMOUNT ;
    let DENOMINATOR;

    const arrayLength = require("./helpers/SGNConversionManager.js").arrayLength;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    before(async function() {
        sgnConversionManager = await artifacts.require("SGNConversionManager").new();
        MAX_AMOUNT        = await sgnConversionManager.MAX_AMOUNT ();
        DENOMINATOR       = await sgnConversionManager.DENOMINATOR();
    });

    describe("legal amount, legal index:", function() {
        for (let index = 0; index < arrayLength; index++) {
            it(`index ${index}`, async function() {
                const numerator = await sgnConversionManager.numerators(index);
                const actual    = await sgnConversionManager.sgn2sga(MAX_AMOUNT, index);
                const expected  = numerator.div(DENOMINATOR).times(MAX_AMOUNT).truncated();
                assert(expected.equals(actual), `expected = ${expected.toFixed()}, actual = ${actual.toFixed()}`);
            });
        }
    });

    describe("illegal amount, legal index:", function() {
        for (let index = 0; index < arrayLength; index++) {
            it(`index ${index}`, async function() {
                await catchInvalidOpcode(sgnConversionManager.sgn2sga(MAX_AMOUNT.plus(1), index));
            });
        }
    });

    describe("legal amount, illegal index:", function() {
        for (let index = arrayLength; index < arrayLength + 1; index++) {
            it(`index ${index}`, async function() {
                await catchInvalidOpcode(sgnConversionManager.sgn2sga(MAX_AMOUNT, index));
            });
        }
    });
});
