contract("ModelCalculatorExtUnitTest", function(accounts) {
    let modelCalculator;
    let A_B_SCALE;
    let a_b_scale;

    const Decimal = require("decimal.js");
    Decimal.set({precision: 100, rounding: Decimal.ROUND_DOWN});

    const intervalLists = require("../../test/sogur/helpers/ModelDataSource.js").intervalLists;
    const NUM_OF_TESTS_PER_INTERVAL = 10;

    before(async function() {
        modelCalculator = await artifacts.require("ModelCalculator").new();
        A_B_SCALE = await modelCalculator.A_B_SCALE();
        a_b_scale = Decimal(A_B_SCALE.toFixed());
    });

    describe("accuracy assertion:", function() {
        for (let row = 0; row < intervalLists.length; row++) {
            for (let col = 0; col < intervalLists[row].length; col++) {
                const [minN, maxN, minR, maxR, alpha, beta] = intervalLists[row][col].map(x => web3.toBigNumber(x));
                const incR = maxR.minus(minR).div(NUM_OF_TESTS_PER_INTERVAL - 1);
                for (let i = 0; i < NUM_OF_TESTS_PER_INTERVAL; i++) {
                    const newR = minR.plus(incR.times(i)).truncated();
                    it(`interval ${row} ${col}, test ${i}: N(R=${newR.toFixed()})`, async function() {
                        if (isTrivialInterval(alpha, beta)) {
                            const valR = newR.minus(minR);
                            const fixedPoint = await modelCalculator.getValN(valR, maxN, maxR);
                            const floatPoint = getValN(valR, maxN, maxR);
                            assert(fixedPoint.equals(floatPoint.truncated()), `fixedPoint = ${fixedPoint.toFixed()}, floatPoint = ${floatPoint.toFixed()}`);
                        }
                        else {
                            const fixedPoint = await modelCalculator.getNewN(newR, minR, minN, alpha, beta);
                            const floatPoint = getNewN(newR, minR, minN, alpha, beta);
                            const ratio = fixedPoint.div(floatPoint);
                            assert(ratio.greaterThanOrEqualTo("0.999999999") && ratio.lessThanOrEqualTo("1"), `ratio = ${ratio.toFixed()}`);
                        }
                    });
                }
            }
        }
        for (let row = 0; row < intervalLists.length; row++) {
            for (let col = 0; col < intervalLists[row].length; col++) {
                const [minN, maxN, minR, maxR, alpha, beta] = intervalLists[row][col].map(x => web3.toBigNumber(x));
                const incN = maxN.minus(minN).div(NUM_OF_TESTS_PER_INTERVAL - 1);
                for (let i = 0; i < NUM_OF_TESTS_PER_INTERVAL; i++) {
                    const newN = minN.plus(incN.times(i)).truncated();
                    it(`interval ${row} ${col}, test ${i}: R(N=${newN.toFixed()})`, async function() {
                        if (isTrivialInterval(alpha, beta)) {
                            const valN = newN.minus(minN);
                            const fixedPoint = await modelCalculator.getValR(valN, maxR, maxN);
                            const floatPoint = getValR(valN, maxR, maxN);
                            assert(fixedPoint.equals(floatPoint.truncated()), `fixedPoint = ${fixedPoint.toFixed()}, floatPoint = ${floatPoint.toFixed()}`);
                        }
                        else {
                            const fixedPoint = await modelCalculator.getNewR(newN, minN, minR, alpha, beta);
                            const floatPoint = getNewR(newN, minN, minR, alpha, beta);
                            const ratio = fixedPoint.div(floatPoint);
                            assert(ratio.greaterThanOrEqualTo("0.999999999") && ratio.lessThanOrEqualTo("1"), `ratio = ${ratio.toFixed()}`);
                        }
                    });
                }
            }
        }
    });

    function isTrivialInterval(alpha, beta) {
        return alpha.equals(A_B_SCALE) && beta.equals(0);
    }

    function getValN(valR, maxN, maxR) {
        return valR.times(maxN).div(maxR);
    }

    function getValR(valN, maxR, maxN) {
        return valN.times(maxR).div(maxN);
    }

    function getNewN(newR, minR, minN, alpha, beta) {
        [newR, minR, minN, alpha, beta] = [newR, minR, minN, alpha, beta].map(x => Decimal(x.toFixed()));
        const temp = newR.div(minR).toPower(alpha.div(a_b_scale));
        return alpha.times(temp).div(alpha.div(minN).plus(beta.times(temp.minus(1))));
    }

    function getNewR(newN, minN, minR, alpha, beta) {
        [newN, minN, minR, alpha, beta] = [newN, minN, minR, alpha, beta].map(x => Decimal(x.toFixed()));
        const temp1 = alpha.minus(beta.times(minN));
        const temp2 = alpha.minus(beta.times(newN));
        return temp1.div(temp2).times(newN).div(minN).toPower(a_b_scale.div(alpha)).times(minR);
    }
});
