contract("PriceBandCalculatorExtUnitTest", function(accounts) {
    let priceBandCalculator;
    let ONE   ;
    let GAMMA ;
    let DELTA ;

    const intervalLists = require("../../test/sogur/helpers/ModelDataSource.js").intervalLists;
    const NUM_OF_TESTS_PER_INTERVAL = 10;
    const AMOUNT = web3.toBigNumber(1000000);

    before(async function() {
        priceBandCalculator = await artifacts.require("PriceBandCalculator").new();
        ONE    = await priceBandCalculator.ONE   ();
        GAMMA  = await priceBandCalculator.GAMMA ();
        DELTA  = await priceBandCalculator.DELTA ();
    });

    describe("accuracy assertion:", function() {
        for (const func of [buy, sell]) {
            for (let row = 0; row < intervalLists.length; row++) {
                for (let col = 0; col < intervalLists[row].length; col++) {
                    const [minN, maxN, minR, maxR, alpha, beta] = intervalLists[row][col].map(x => web3.toBigNumber(x));
                    const incN = maxN.minus(minN).div(NUM_OF_TESTS_PER_INTERVAL - 1);
                    for (let i = 0; i < NUM_OF_TESTS_PER_INTERVAL; i++) {
                        const sgrTotal = minN.plus(incN.times(i)).truncated();
                        it(`function ${func.name}, interval ${row} ${col}, test ${i}`, async function() {
                            const [fixedPoint, floatPoint] = await func(AMOUNT, sgrTotal, alpha, beta);
                            const ratio = fixedPoint.div(floatPoint);
                            assert(ratio.greaterThanOrEqualTo("0.99999") && ratio.lessThanOrEqualTo("1"), `ratio = ${ratio.toFixed()}`);
                        });
                    }
                }
            }
        }
    });

    function buyFunc(sdrAmount, sgrTotal, alpha, beta) {
        const reserveRatio = alpha.minus(beta.times(sgrTotal));
        const variableFix = sdrAmount.times(reserveRatio.times(ONE)).div(reserveRatio.times(ONE.minus(DELTA)).plus(GAMMA));
        return variableFix;
    }

    function sellFunc(sdrAmount, sgrTotal, alpha, beta) {
        const reserveRatio = alpha.minus(beta.times(sgrTotal));
        const variableFix = sdrAmount.times(reserveRatio.times(ONE.plus(DELTA)).minus(GAMMA)).div(reserveRatio.times(ONE));
        return variableFix;
    }

    async function buy(sdrAmount, sgrTotal, alpha, beta) {
        const fixedPoint = await priceBandCalculator.buy(sdrAmount, sgrTotal, alpha, beta);
        const floatPoint = buyFunc(sdrAmount, sgrTotal, alpha, beta);
        return [fixedPoint, floatPoint];
    }

    async function sell(sdrAmount, sgrTotal, alpha, beta) {
        const fixedPoint = await priceBandCalculator.sell(sdrAmount, sgrTotal, alpha, beta);
        const floatPoint = sellFunc(sdrAmount, sgrTotal, alpha, beta);
        return [fixedPoint, floatPoint];
    }
});
