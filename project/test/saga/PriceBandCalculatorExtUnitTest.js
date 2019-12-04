contract("PriceBandCalculatorExtUnitTest", function(accounts) {
    let priceBandCalculator;
    let ONE   ;
    let GAMMA ;
    let DELTA ;
    let BUY_N ;
    let BUY_D ;
    let SELL_N;
    let SELL_D;

    const intervalLists = require("../../test/saga/helpers/ModelDataSource.js").intervalLists;
    const NUM_OF_TESTS_PER_INTERVAL = 10;
    const AMOUNT = web3.toBigNumber(1000000);

    before(async function() {
        priceBandCalculator = await artifacts.require("PriceBandCalculator").new();
        ONE    = await priceBandCalculator.ONE   ();
        GAMMA  = await priceBandCalculator.GAMMA ();
        DELTA  = await priceBandCalculator.DELTA ();
        BUY_N  = await priceBandCalculator.BUY_N ();
        BUY_D  = await priceBandCalculator.BUY_D ();
        SELL_N = await priceBandCalculator.SELL_N();
        SELL_D = await priceBandCalculator.SELL_D();
    });

    describe("accuracy assertion:", function() {
        for (const func of [buy, sell]) {
            for (let row = 0; row < intervalLists.length; row++) {
                for (let col = 0; col < intervalLists[row].length; col++) {
                    const [minN, maxN, minR, maxR, alpha, beta] = intervalLists[row][col].map(x => web3.toBigNumber(x));
                    const incN = maxN.minus(minN).div(NUM_OF_TESTS_PER_INTERVAL - 1);
                    for (let i = 0; i < NUM_OF_TESTS_PER_INTERVAL; i++) {
                        const sgaTotal = minN.plus(incN.times(i)).truncated();
                        it(`function ${func.name}, interval ${row} ${col}, test ${i}`, async function() {
                            const [fixedPoint, floatPoint] = await func(AMOUNT, sgaTotal, alpha, beta);
                            const ratio = fixedPoint.div(floatPoint);
                            assert(ratio.greaterThanOrEqualTo("0.99999") && ratio.lessThanOrEqualTo("1"), `ratio = ${ratio.toFixed()}`);
                        });
                    }
                }
            }
        }
    });

    function buyFunc(sdrAmount, sgaTotal, alpha, beta) {
        const reserveRatio = alpha.minus(beta.times(sgaTotal));
        const variableFix = sdrAmount.times(reserveRatio.times(ONE)).div(reserveRatio.times(ONE.minus(DELTA)).plus(GAMMA));
        const constantFix = sdrAmount.times(BUY_N).div(BUY_D);
        return constantFix.lessThanOrEqualTo(variableFix) ? constantFix : variableFix;
    }

    function sellFunc(sdrAmount, sgaTotal, alpha, beta) {
        const reserveRatio = alpha.minus(beta.times(sgaTotal));
        const variableFix = sdrAmount.times(reserveRatio.times(ONE.plus(DELTA)).minus(GAMMA)).div(reserveRatio.times(ONE));
        const constantFix = sdrAmount.times(SELL_N).div(SELL_D);
        return constantFix.lessThanOrEqualTo(variableFix) ? constantFix : variableFix;
    }

    async function buy(sdrAmount, sgaTotal, alpha, beta) {
        const fixedPoint = await priceBandCalculator.buy(sdrAmount, sgaTotal, alpha, beta);
        const floatPoint = buyFunc(sdrAmount, sgaTotal, alpha, beta);
        return [fixedPoint, floatPoint];
    }

    async function sell(sdrAmount, sgaTotal, alpha, beta) {
        const fixedPoint = await priceBandCalculator.sell(sdrAmount, sgaTotal, alpha, beta);
        const floatPoint = sellFunc(sdrAmount, sgaTotal, alpha, beta);
        return [fixedPoint, floatPoint];
    }
});
