contract("SGAToSGRTokenExchangeUnitTest", function(accounts) {
    let sgaToken;
    let sgrToken;
    let targetSgaAddress;


    const sgaHolder  = accounts[3];

    const catchRevert = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;
    const nullAddress        = require("../utilities.js").address(0);

    beforeEach(async function() {
        sgaToken                    = await artifacts.require("ERC20Mockup"                         ).new();
        sgrToken                    = await artifacts.require("ERC20Mockup"                         ).new();
        sgaTokenMigration                    = await artifacts.require("SGAToSGRTokenExchange"                         ).new(sgaToken.address, sgrToken.address);

        targetSgaAddress = await  sgaTokenMigration.SGA_TARGET_ADDRESS.call();
    });

    describe("constructor:", function() {
        it("targetSga should be migration contract address", async function() {
           assert.equal(await sgaTokenMigration.SGA_TARGET_ADDRESS.call() , "0x0000000000000000000000000000000000000001");
        });

        it("should fail if _sgaToken is null", async function() {
           sgrToken                    = await artifacts.require("ERC20Mockup"                         ).new();
           await catchRevert(artifacts.require("SGAToSGRTokenExchange"                         ).new(nullAddress, sgrToken.address));
        });

        it("should fail if _sgrToken is null", async function() {
           sgaToken                    = await artifacts.require("ERC20Mockup"                         ).new();
           await catchRevert(artifacts.require("SGAToSGRTokenExchange"                         ).new(sgaToken.address, nullAddress));
        });

        it("should set valid values", async function() {
           sgaToken                    = await artifacts.require("ERC20Mockup"                         ).new();
           sgrToken                    = await artifacts.require("ERC20Mockup"                         ).new();
           sgaTokenMigration = await artifacts.require("SGAToSGRTokenExchange"                         ).new(sgaToken.address, sgrToken.address);

          assert.equal(await sgaTokenMigration.sgaToken.call() ,  sgaToken.address);
          assert.equal(await sgaTokenMigration.sgrToken.call() , sgrToken.address);
        });
    });

    const exchangeMethods = ["exchangeSGAtoSGR", "exchangeSGAtoSGRFor"];
    exchangeMethods.forEach(exchangeMethod => {
    describe(`${exchangeMethod}:`, function() {

        if(exchangeMethod == "exchangeSGAtoSGRFor"){
          it("should abort with an error if called with sgaHolder address null", async function() {
             sgaToken.setAllowance(1000);
             sgaToken.setBalance(1000);
             await catchRevert(executeExchange(nullAddress));
          });
        }

        it("should exchangeSGAtoSGR on msg sender", async function() {
          sgaToken.setAllowance(1000);
          sgaToken.setBalance(1000);

          const response = await executeExchange(accounts[5]);
          await assertExchange(response, 1000, 1000, 1000, accounts[5])
        });

        it("should exchangeSGAtoSGR all the balance if allowance  is greater then balance", async function() {
          sgaToken.setAllowance(2000);
          sgaToken.setBalance(1000);

          const response = await executeExchange(sgaHolder);
          await assertExchange(response, 1000, 1000, 2000)
        });

        it("should exchangeSGAtoSGR all the balance if allowance  is equal to balance", async function() {
          sgaToken.setAllowance(1000);
          sgaToken.setBalance(1000);

          const response = await executeExchange(sgaHolder);
          await assertExchange(response, 1000, 1000, 1000)
        });

        it("should exchangeSGAtoSGR all the allowance if allowance is lower then balance", async function() {
          sgaToken.setAllowance(1000);
          sgaToken.setBalance(2000);

          const response = await executeExchange(sgaHolder);
          await assertExchange(response, 1000, 2000, 1000)
        });


        it("should fail if no balance at all", async function() {
          sgaToken.setAllowance(2000);
          sgaToken.setBalance(0);

          await catchRevert(executeExchange(sgaHolder));
        });

        it("should fail if no allowance at all", async function() {
          sgaToken.setAllowance(0);
          sgaToken.setBalance(1000);

          await catchRevert(executeExchange(sgaHolder));
        });
    });

     async function executeExchange(executor) {
              if(exchangeMethod == "exchangeSGAtoSGR")
                return await sgaTokenMigration.exchangeSGAtoSGR({from : executor});
              else if(exchangeMethod == "exchangeSGAtoSGRFor"){
              return await sgaTokenMigration.exchangeSGAtoSGRFor(executor);
              }
              else
              throw "unsupported";
            }

} );


            async function assertExchange(response, valueExchanged, eventBalance, eventAllowance, _sgaHolder = sgaHolder) {
              assert.equal(response.logs[0].args._sgaHolder.toString(), _sgaHolder.toString());
              assert.equal(response.logs[0].args._exchangedAmount.toString(), valueExchanged.toString());
              assert.equal(response.logs[0].event, "ExchangeSgaForSgrCompleted");

              assert.equal(await sgaToken.transferFromCalledWithTo.call(), targetSgaAddress);
              assert.equal((await sgaToken.transferFromCalledWithValue.call()).toString(), valueExchanged.toString());
              assert.equal(await sgaToken.transferFromCalledWithFrom.call(), _sgaHolder);

              assert.equal(await sgrToken.transferCalledWithTo.call(), _sgaHolder);
              assert.equal(await sgrToken.transferCalledWithValue.call(), valueExchanged);
            }
});
