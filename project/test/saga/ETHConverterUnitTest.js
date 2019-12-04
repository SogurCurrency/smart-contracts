contract("ETHConverterUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let transactionLimiter;
    let ethConverter;
    let MAX_RESOLUTION;
    let ILLEGAL_VAL;

    const SEQUENCE_NUM = 1000;
    const HI_PRICE_N   = 2000;
    const HI_PRICE_D   = 2000;
    const LO_PRICE_N   = 3000;
    const LO_PRICE_D   = 3000;
    const AMOUNT       = 4000;

    const owner = accounts[0];

    const assertEqual = require("../utilities.js").assertEqual;
    const catchRevert = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        transactionLimiter          = await artifacts.require("TransactionLimiterMockup"         ).new();
        rateApprover          = await artifacts.require("RateApproverMockup"         ).new();
        ethConverter        = await artifacts.require("ETHConverter"             ).new(contractAddressLocatorProxy.address);
        MAX_RESOLUTION              = await ethConverter.MAX_RESOLUTION();
        ILLEGAL_VAL                 = MAX_RESOLUTION.plus(1);
        await rateApprover.setIsValid(true);
    });

    describe("security assertion:", function() {
        before(async function() {
            await contractAddressLocatorProxy.set("ITransactionLimiter", transactionLimiter.address);
            await contractAddressLocatorProxy.set("IRateApprover", rateApprover.address);
        });
        it("function setPrice should abort with an error if called by a non-administrator", async function() {
            await catchRevert(ethConverter.setPrice(SEQUENCE_NUM, HI_PRICE_N, HI_PRICE_D, LO_PRICE_N, LO_PRICE_D, {from: owner}));
        });
        after(async function() {
            await ethConverter.accept(owner, {from: owner});
        });
    });

    describe("functionality assertion:", function() {
        it("function setPrice should abort with an error if high price is smaller than low price", async function() {
            await catchRevert(ethConverter.setPrice(SEQUENCE_NUM, HI_PRICE_N + 0, HI_PRICE_D + 1, LO_PRICE_N + 1, LO_PRICE_D + 0));
        });
        it("function setPrice should abort with an error if any input value is out of range", async function() {
            await catchRevert(ethConverter.setPrice(SEQUENCE_NUM, 0          , HI_PRICE_D , LO_PRICE_N , LO_PRICE_D ));
            await catchRevert(ethConverter.setPrice(SEQUENCE_NUM, ILLEGAL_VAL, HI_PRICE_D , LO_PRICE_N , LO_PRICE_D ));
            await catchRevert(ethConverter.setPrice(SEQUENCE_NUM, HI_PRICE_N , 0          , LO_PRICE_N , LO_PRICE_D ));
            await catchRevert(ethConverter.setPrice(SEQUENCE_NUM, HI_PRICE_N , ILLEGAL_VAL, LO_PRICE_N , LO_PRICE_D ));
            await catchRevert(ethConverter.setPrice(SEQUENCE_NUM, HI_PRICE_N , HI_PRICE_D , 0          , LO_PRICE_D ));
            await catchRevert(ethConverter.setPrice(SEQUENCE_NUM, HI_PRICE_N , HI_PRICE_D , ILLEGAL_VAL, LO_PRICE_D ));
            await catchRevert(ethConverter.setPrice(SEQUENCE_NUM, HI_PRICE_N , HI_PRICE_D , LO_PRICE_N , 0          ));
            await catchRevert(ethConverter.setPrice(SEQUENCE_NUM, HI_PRICE_N , HI_PRICE_D , LO_PRICE_N , ILLEGAL_VAL));
        });
        it("function toSdrAmount should abort with an error if called before setting price", async function() {
            await catchInvalidOpcode(ethConverter.toSdrAmount(AMOUNT));
        });
        it("function toEthAmount should abort with an error if called before setting price", async function() {
            await catchInvalidOpcode(ethConverter.toEthAmount(AMOUNT));
        });
        it("function fromEthAmount should abort with an error if called before setting price", async function() {
            await catchInvalidOpcode(ethConverter.fromEthAmount(AMOUNT));
        });
        it("function setPrice should abort with an error if rateApprover failing", async function() {
            await rateApprover.setIsValid(false);
            await catchRevert(ethConverter.setPrice(SEQUENCE_NUM, HI_PRICE_N + 0, HI_PRICE_D + 0, LO_PRICE_N + 0, LO_PRICE_D + 0));
            await rateApprover.setIsValid(true);
        });
        it("function setPrice should complete successfully if all input values are within range", async function() {
            await setPrice(SEQUENCE_NUM, HI_PRICE_N + 0, HI_PRICE_D + 0, LO_PRICE_N + 0, LO_PRICE_D + 0, "PriceSaved"   );
            await setPrice(SEQUENCE_NUM, HI_PRICE_N + 1, HI_PRICE_D + 1, LO_PRICE_N + 1, LO_PRICE_D + 1, "PriceNotSaved");
            await assertEqual(ethConverter.highPriceN(), HI_PRICE_N + 0);
            await assertEqual(ethConverter.highPriceD(), HI_PRICE_D + 0);
            await assertEqual(ethConverter.lowPriceN(), LO_PRICE_N + 0);
            await assertEqual(ethConverter.lowPriceD(), LO_PRICE_D + 0);
        });
    });

    test(toSdrAmount  , toSdrAmountFunc  );
    test(toEthAmount  , toEthAmountFunc  );
    test(fromEthAmount, fromEthAmountFunc);

    async function setPrice(sequenceNum, highPriceN, highPriceD, lowPriceN, lowPriceD, eventName) {
        const response = await ethConverter.setPrice(sequenceNum, highPriceN, highPriceD, lowPriceN, lowPriceD);
        assert.equal(response.logs[0].args._highPriceN.toString(), highPriceN.toString());
        assert.equal(response.logs[0].args._highPriceD.toString(), highPriceD.toString());
        assert.equal(response.logs[0].args._lowPriceN.toString(), lowPriceN.toString());
        assert.equal(response.logs[0].args._lowPriceD.toString(), lowPriceD.toString());
        assert.equal(response.logs[0].event, eventName);
    }

    function test(func, testFunc) {
        describe(`function ${func.name}:`, function() {
            for (let priceN = 1; priceN <= 10; priceN++) {
                for (let priceD = 1; priceD <= 10; priceD++) {
                    it(`priceN = ${priceN}, priceD = ${priceD}`, async function() {
                        await ethConverter.setPrice(Date.now(), priceN, priceD, priceN, priceD);
                        await assertEqual(func(AMOUNT), testFunc(AMOUNT, priceN, priceD));
                    });
                }
            }
        });
    }

    async function toSdrAmount  (ethAmount) {return await ethConverter.toSdrAmount  (ethAmount);}
    async function toEthAmount  (sdrAmount) {return await ethConverter.toEthAmount  (sdrAmount);}
    async function fromEthAmount(ethAmount) {return await ethConverter.fromEthAmount(ethAmount);}

    function toSdrAmountFunc  (ethAmount, priceN, priceD) {return Math.floor(ethAmount * priceN / priceD);}
    function toEthAmountFunc  (sdrAmount, priceN, priceD) {return Math.floor(sdrAmount * priceD / priceN);}
    function fromEthAmountFunc(ethAmount, priceN, priceD) {return Math.floor(ethAmount * priceN / priceD);}
});
