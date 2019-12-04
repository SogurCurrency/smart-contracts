contract("SGAAuthorizationManagerUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let authorizationDataSource;
    let sgaAuthorizationManager;

    const Flag = require("../authorization/helpers/AuthorizationActionRoles.js").Flag;
    const test = require("../authorization/helpers/AuthorizationActionRoles.js").test;

    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        authorizationDataSource     = await artifacts.require("AuthorizationDataSourceMockup"    ).new();
        sgaAuthorizationManager     = await artifacts.require("SGAAuthorizationManager"          ).new(contractAddressLocatorProxy.address);
    });

    describe("function isAuthorizedForPublicOperation:", function() {
        const testedAddress = "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf"

        beforeEach(async function() {
           contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
           authorizationDataSource     = await artifacts.require("AuthorizationDataSourceMockup"    ).new();
           sgaAuthorizationManager     = await artifacts.require("SGAAuthorizationManager"          ).new(contractAddressLocatorProxy.address);

           await contractAddressLocatorProxy.set("IAuthorizationDataSource", authorizationDataSource.address);
        });
        it("should return true if is authorized true", async function() {
           await authorizationDataSource.set(testedAddress, true, 2, 0, 0);
           assert.equal(await sgaAuthorizationManager.isAuthorizedForPublicOperation(testedAddress), true);
        });
        it("should return false if is authorized false", async function() {
           await authorizationDataSource.set(testedAddress, false, 2, 0, 0);
           assert.equal(await sgaAuthorizationManager.isAuthorizedForPublicOperation(testedAddress), false);
        });
    });
    describe("functionality assertion:", function() {
        before(async function() {
            await contractAddressLocatorProxy.set("IAuthorizationDataSource", authorizationDataSource.address);
        });
        test(set, accounts, isAuthorizedToBuy         , [Flag.BuySga                                            ]);
        test(set, accounts, isAuthorizedToSell        , [Flag.SellSga                                           ]);
        test(set, accounts, isAuthorizedToTransfer    , [Flag.TransferSga    , Flag.ReceiveSga                  ]);
        test(set, accounts, isAuthorizedToTransferFrom, [Flag.TransferFromSga, Flag.TransferSga, Flag.ReceiveSga]);
    });

    async function set                       (...args) {return await authorizationDataSource.set                       (...args);}
    async function isAuthorizedToBuy         (...args) {return await sgaAuthorizationManager.isAuthorizedToBuy         (...args);}
    async function isAuthorizedToSell        (...args) {return await sgaAuthorizationManager.isAuthorizedToSell        (...args);}
    async function isAuthorizedToTransfer    (...args) {return await sgaAuthorizationManager.isAuthorizedToTransfer    (...args);}
    async function isAuthorizedToTransferFrom(...args) {return await sgaAuthorizationManager.isAuthorizedToTransferFrom(...args);}
});
