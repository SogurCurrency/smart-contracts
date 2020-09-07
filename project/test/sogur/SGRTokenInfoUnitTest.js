contract("SGRTokenInfoUnitTest", function(accounts) {
    let sgrTokenInfo;

    beforeEach(async function() {
        sgrTokenInfo = await artifacts.require("SGRTokenInfo").new();
    });

    describe("check return values:", function() {
       it("should return Sogur for name", async function() {
          assert(await sgrTokenInfo.getName() == "Sogur");
       });

       it("should return SGR for symbol", async function() {
          assert(await sgrTokenInfo.getSymbol() == "SGR");
       });

       it("should return 18 for decimals", async function() {
          assert(await sgrTokenInfo.getDecimals() == 18);
       });
    });
});
