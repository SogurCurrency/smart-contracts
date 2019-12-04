contract("WalletsTradingLimiterValueConverterUnitTest", function(accounts) {
    let walletsTradingLimiterValueConverter;
    let MAX_RESOLUTION;
    let ILLEGAL_VAL;

    const SEQUENCE_NUM = 1000;
    const PRICE_N      = 2000;
    const PRICE_D      = 3000;
    const AMOUNT       = 4000;

    const owner = accounts[0];

    const assertEqual = require("../utilities.js").assertEqual;
    const catchRevert = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    before(async function() {
        walletsTradingLimiterValueConverter = await artifacts.require("WalletsTradingLimiterValueConverter").new();
        MAX_RESOLUTION   = await walletsTradingLimiterValueConverter.MAX_RESOLUTION();
        ILLEGAL_VAL      = MAX_RESOLUTION.plus(1);
    });

    describe("security assertion:", function() {
        it("function setPrice should abort with an error if called by a non-administrator", async function() {
            await catchRevert(walletsTradingLimiterValueConverter.setPrice(SEQUENCE_NUM, PRICE_N, PRICE_D, {from: owner}));
        });
        after(async function() {
            await walletsTradingLimiterValueConverter.accept(owner, {from: owner});
        });
    });

    describe("functionality assertion:", function() {
        it("function setPrice should abort with an error if any input value is out of range", async function() {
            await catchRevert(walletsTradingLimiterValueConverter.setPrice(SEQUENCE_NUM, 0          , PRICE_D    ));
            await catchRevert(walletsTradingLimiterValueConverter.setPrice(SEQUENCE_NUM, ILLEGAL_VAL, PRICE_D    ));
            await catchRevert(walletsTradingLimiterValueConverter.setPrice(SEQUENCE_NUM, PRICE_N    , 0          ));
            await catchRevert(walletsTradingLimiterValueConverter.setPrice(SEQUENCE_NUM, PRICE_N    , ILLEGAL_VAL));
        });
        it("function toLimiterValue should abort with an error if called before setting price", async function() {
            await catchInvalidOpcode(walletsTradingLimiterValueConverter.toLimiterValue(AMOUNT));
        });
        it("function setPrice should complete successfully if all input values are within range", async function() {
            await setPrice(SEQUENCE_NUM, PRICE_N + 0, PRICE_D + 0, "PriceSaved"   );
            await setPrice(SEQUENCE_NUM, PRICE_N + 1, PRICE_D + 1, "PriceNotSaved");
            await assertEqual(walletsTradingLimiterValueConverter.priceN(), PRICE_N + 0);
            await assertEqual(walletsTradingLimiterValueConverter.priceD(), PRICE_D + 0);
        });

    });

    test(toLimiterValue, toLimiterValueFunc);

    async function setPrice(sequenceNum, priceN, priceD, eventName) {
        const response = await walletsTradingLimiterValueConverter.setPrice(sequenceNum, priceN, priceD);
        assert.equal(response.logs[0].args._priceN.toString(), priceN.toString());
        assert.equal(response.logs[0].args._priceD.toString(), priceD.toString());
        assert.equal(response.logs[0].event, eventName);
    }

    function test(func, testFunc) {
        describe(`function ${func.name}:`, function() {
            for (let priceN = 1; priceN <= 10; priceN++) {
                for (let priceD = 1; priceD <= 10; priceD++) {
                    it(`priceN = ${priceN}, priceD = ${priceD}`, async function() {
                        await walletsTradingLimiterValueConverter.setPrice(Date.now(), priceN, priceD);
                        await assertEqual(func(AMOUNT), testFunc(AMOUNT, priceN, priceD));
                    });
                }
            }
        });
    }

    async function toLimiterValue(sgaAmount) {return await walletsTradingLimiterValueConverter.toLimiterValue(sgaAmount);}

    function toLimiterValueFunc(sgaAmount, priceN, priceD) {return Math.floor(sgaAmount * priceN / priceD);}
});
