contract("ModelCalculatorIntUnitTest", function(accounts) {
    let modelCalculator;
    let FIXED_ONE;

    const Decimal = require("decimal.js");
    Decimal.set({precision: 100, rounding: Decimal.ROUND_DOWN});
    web3.BigNumber.config({DECIMAL_PLACES: 100, ROUNDING_MODE: web3.BigNumber.ROUND_DOWN});

    const ZERO    = web3.toBigNumber(0);
    const ONE     = web3.toBigNumber(1);
    const TOO_BIG = web3.toBigNumber(100);
    const LOG_MAX = web3.toBigNumber(Decimal.exp(3).toFixed());
    const EXP_MAX = web3.toBigNumber(Decimal.pow(2,3).toFixed());

    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    before(async function() {
        modelCalculator = await artifacts.require("ModelCalculatorExposure").new();
        FIXED_ONE = await modelCalculator.FIXED_ONE();
    });

    describe("functionality assertion:", function() {
        fail(log, ZERO   , ONE    , 100);
        pass(log, ONE    , LOG_MAX, 100);
        fail(log, LOG_MAX, TOO_BIG, 100);
        pass(exp, ZERO   , EXP_MAX, 100);
        fail(exp, EXP_MAX, TOO_BIG, 100);
    });

    function pass(func, min, max, len) {
        for (const x of values(min, max, len)) {
            it(`function ${func.name}(${x.toFixed(2)}) should pass`, async function() {
                await func(x);
            });
        }
    }

    function fail(func, min, max, len) {
        for (const x of values(min, max, len)) {
            it(`function ${func.name}(${x.toFixed(2)}) should fail`, async function() {
                await catchInvalidOpcode(func(x));
            });
        }
    }

    async function log(x) {await modelCalculator.logFunc(FIXED_ONE.times(x).truncated());}
    async function exp(x) {await modelCalculator.expFunc(FIXED_ONE.times(x).truncated());}

    function values(min, max, len) {return Array(len).fill().map((x, n) => web3.toBigNumber(n).div(len).times(max.minus(min)).plus(min));}
});
