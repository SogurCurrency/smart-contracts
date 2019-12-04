contract("PriceBandCalculatorIntUnitTest", function(accounts) {
    let priceBandCalculator;
    let MIN_RR ;
    let MAX_RR ;
    let MAX_SDR;

    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    before(async function() {
        priceBandCalculator = await artifacts.require("PriceBandCalculator").new();
        MIN_RR  = await priceBandCalculator.MIN_RR ();
        MAX_RR  = await priceBandCalculator.MAX_RR ();
        MAX_SDR = await priceBandCalculator.MAX_SDR();
    });

    describe("integrity assertion:", function() {
        it("function buy should abort with an error if the reserve-ratio is below the minimum", async function() {
            await catchInvalidOpcode(priceBandCalculator.buy(0, 0, MIN_RR.minus(1), 0));
        });
        it("function buy should abort with an error if the reserve-ratio is above the maximum", async function() {
            await catchInvalidOpcode(priceBandCalculator.buy(0, 0, MAX_RR.plus(1), 0));
        });
        it("function buy should abort with an error if the amount of SDR is above the maximum", async function() {
            await catchInvalidOpcode(priceBandCalculator.buy(MAX_SDR.plus(1), 0, 0, 0));
        });
        it("function sell should abort with an error if the reserve-ratio is below the minimum", async function() {
            await catchInvalidOpcode(priceBandCalculator.sell(0, 0, MIN_RR.minus(1), 0));
        });
        it("function sell should abort with an error if the reserve-ratio is above the maximum", async function() {
            await catchInvalidOpcode(priceBandCalculator.sell(0, 0, MAX_RR.plus(1), 0));
        });
        it("function sell should abort with an error if the amount of SDR is above the maximum", async function() {
            await catchInvalidOpcode(priceBandCalculator.sell(MAX_SDR.plus(1), 0, 0, 0));
        });
    });
});
