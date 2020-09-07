contract("MintManagerUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let modelDataSource;
    let mintingPointTimersManager;
    let sgrAuthorizationManager;
    let mintHandler;
    let mintListener;
    let mintManager;

    const catchRevert        = require("../exceptions.js").catchRevert;

    before(async function() {
      await rebuild();
    });

    describe("authorization assertion:", function() {
      beforeEach(async function() {
        await rebuild();
      });


      it("should abort with an error if called by a non authorized user", async function() {
        await sgrAuthorizationManager.setState(false);
        await catchRevert(mintManager.updateMintingState());
      });

      it("should succeed if called by an authorized user", async function() {
        await sgrAuthorizationManager.setState(true);
        await mintManager.updateMintingState();
      });
    });

    describe("functionality assertion:", function() {
      before(async function() {
        await rebuild();
      });

      for (const expired of [false, true]) {
         for (let index = 0; index < 10; index++) {
            it(`expired = ${expired}, index = ${index}`, async function() {
               await mintingPointTimersManager.setExpired(expired);
               await mintManager.setIndex(index);
               const state = await mintManager.isMintingStateOutdated();
               await mintManager.updateMintingState();
               const expected = state ? index + 1 : index;
               const actual = await mintManager.getIndex();
               assert(actual.equals(expected), `expected = ${expected}, actual = ${actual}`);
            });
         }
      }
    });

    async function rebuild() {
      contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
      modelDataSource                  = await artifacts.require("ModelDataSourceMockup"                 ).new();
      mintingPointTimersManager                 = await artifacts.require("MintingPointTimersManagerMockup"                ).new();
      mintHandler                 = await artifacts.require("MintHandlerMockup"                ).new();
      mintListener                = await artifacts.require("MintListenerMockup"               ).new();
      mintManager                 = await artifacts.require("MintManagerExposure"              ).new(contractAddressLocatorProxy.address);
      sgrAuthorizationManager        = await artifacts.require("SGRAuthorizationManagerMockup"    ).new();

      await contractAddressLocatorProxy.set("IModelDataSource"  , modelDataSource  .address);
      await contractAddressLocatorProxy.set("IMintingPointTimersManager" , mintingPointTimersManager .address);
      await contractAddressLocatorProxy.set("IMintHandler" , mintHandler .address);
      await contractAddressLocatorProxy.set("IMintListener", mintListener.address);
      await contractAddressLocatorProxy.set("ISGRAuthorizationManager", sgrAuthorizationManager.address);
      await sgrAuthorizationManager.setState(true);
    }
});
