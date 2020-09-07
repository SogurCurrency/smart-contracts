contract("SGAToSGRInitializerUnitTest", function(accounts) {
    const owner = accounts[0];
    const nonOwner = accounts[1];

    const VALID_AMOUNT = 1000;

    let redButton;
    let sgaToken;
    let sgrToken;
    let sgaMonetaryModelState;
    let sgrMonetaryModelState;
    let sgaToSGRInitializer;

    let validSGAToSGRTokenExchangeAddress = accounts[5];


    const catchRevert = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;
    const nullAddress        = require("../utilities.js").address(0);

    beforeEach(async function() {
        redButton                    = await artifacts.require("RedButtonMockup"                         ).new();
        sgaToken                    = await artifacts.require("ERC20Mockup"                         ).new();
        sgrToken                    = await artifacts.require("SGRTokenMockup"                         ).new();
        sgaMonetaryModelState       = await artifacts.require("SGAMonetaryModelStateMockup"                         ).new();
        sgrMonetaryModelState       = await artifacts.require("MonetaryModelStateMockup"                         ).new();

        await redButton.setEnabled(true);
        sgaToSGRInitializer       = await artifacts.require("SGAToSGRInitializer"                         ).new(redButton.address, sgaToken.address, sgrToken.address, sgaMonetaryModelState.address, sgrMonetaryModelState.address, validSGAToSGRTokenExchangeAddress);
    });

    describe("constructor:", function() {
        it("should fail if null address", async function() {
           validAddress = accounts[0];
           await catchRevert( artifacts.require("SGAToSGRInitializer").new(nullAddress, validAddress, validAddress, validAddress, validAddress, validAddress));
           await catchRevert( artifacts.require("SGAToSGRInitializer").new(validAddress, nullAddress, validAddress, validAddress, validAddress, validAddress));
           await catchRevert( artifacts.require("SGAToSGRInitializer").new(validAddress, validAddress, nullAddress, validAddress, validAddress, validAddress));
           await catchRevert( artifacts.require("SGAToSGRInitializer").new(validAddress, validAddress, validAddress, nullAddress, validAddress, validAddress));
           await catchRevert( artifacts.require("SGAToSGRInitializer").new(validAddress, validAddress, validAddress, validAddress, nullAddress, validAddress));
           await catchRevert( artifacts.require("SGAToSGRInitializer").new(validAddress, validAddress, validAddress, validAddress, validAddress, nullAddress));
        });

        it("should set valid values", async function() {
          assert.equal(await sgaToSGRInitializer.redButton.call() ,  redButton.address);
          assert.equal(await sgaToSGRInitializer.sgaToken.call() ,  sgaToken.address);
          assert.equal(await sgaToSGRInitializer.sgrToken.call() , sgrToken.address);
          assert.equal(await sgaToSGRInitializer.sgaMonetaryModelState.call() , sgaMonetaryModelState.address);
          assert.equal(await sgaToSGRInitializer.sgrMonetaryModelState.call() , sgrMonetaryModelState.address);
          assert.equal(await sgaToSGRInitializer.sgaToSGRTokenExchangeAddress.call() , validSGAToSGRTokenExchangeAddress);
        });
    });

    describe("executeInitialization:", function() {

        it("should fail if calling with non owner", async function() {
           await setAmounts( VALID_AMOUNT, VALID_AMOUNT, VALID_AMOUNT );
           await catchRevert(sgaToSGRInitializer.executeInitialization({from : nonOwner}));
        });

        it("should fail if calling with red button not enabled", async function() {
           await setAmounts( VALID_AMOUNT, VALID_AMOUNT, VALID_AMOUNT );
           await redButton.setEnabled(false);

           await catchRevert(sgaToSGRInitializer.executeInitialization({from : owner}));
        });
        it("should call init with valid values", async function() {
           await setAmounts( VALID_AMOUNT, VALID_AMOUNT, VALID_AMOUNT );
           await sgaToSGRInitializer.executeInitialization({from : owner});

           assert(await sgrToken.sgaToSGRTokenExchangeAddress.call(), validSGAToSGRTokenExchangeAddress);
           assert(await sgrToken.sgaToSGRTokenExchangeSGRSupply.call(), VALID_AMOUNT);

           assert(await sgrMonetaryModelState.getSdrTotal(), VALID_AMOUNT);
           assert(await sgrMonetaryModelState.getSgrTotal(), VALID_AMOUNT);
        });
    });

    describe("getInitializationAmount:", function() {
        it("should fail if sga amounts not equal", async function() {
          await setAmounts(VALID_AMOUNT, VALID_AMOUNT, VALID_AMOUNT + 1);
          await catchRevert(sgaToSGRInitializer.getInitializationAmount());
        });

        it("should fail if sga amounts not equal", async function() {
          await setAmounts(VALID_AMOUNT, VALID_AMOUNT+ 1, VALID_AMOUNT );
          await catchRevert(sgaToSGRInitializer.getInitializationAmount());
        });

        it("should fail if sga amounts not equal", async function() {
          await setAmounts( VALID_AMOUNT+ 1, VALID_AMOUNT, VALID_AMOUNT );
          await catchRevert(sgaToSGRInitializer.getInitializationAmount());
        });

        it("should return valid amount", async function() {
          await setAmounts( VALID_AMOUNT, VALID_AMOUNT, VALID_AMOUNT );
          let actualAmount = await sgaToSGRInitializer.getInitializationAmount();
          assert(actualAmount, VALID_AMOUNT);
        });
    });

    async function setAmounts(sgaTotal , sdrTotal , totalSupply ) {
        await sgaMonetaryModelState.setSgaTotal(sgaTotal);
        await sgaMonetaryModelState.setSdrTotal(sdrTotal);
        await sgaToken.setTotalSupply(totalSupply);
    }
});
