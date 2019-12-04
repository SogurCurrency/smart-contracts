contract("SGNAuthorizationManagerUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let authorizationDataSource;
    let sgnAuthorizationManager;

    const Flag = require("../authorization/helpers/AuthorizationActionRoles.js").Flag;
    const test = require("../authorization/helpers/AuthorizationActionRoles.js").test;

    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        authorizationDataSource     = await artifacts.require("AuthorizationDataSourceMockup"    ).new();
        sgnAuthorizationManager     = await artifacts.require("SGNAuthorizationManager"          ).new(contractAddressLocatorProxy.address);
    });

    describe("functionality assertion:", function() {
        before(async function() {
            await contractAddressLocatorProxy.set("IAuthorizationDataSource", authorizationDataSource.address);
        });
        test(set, accounts, isAuthorizedToSell        , [Flag.SellSgn                                           ]);
        test(set, accounts, isAuthorizedToTransfer    , [Flag.TransferSgn    , Flag.ReceiveSgn                  ]);
        test(set, accounts, isAuthorizedToTransferFrom, [Flag.TransferFromSgn, Flag.TransferSgn, Flag.ReceiveSgn]);
    });

    async function set                       (...args) {return await authorizationDataSource.set                       (...args);}
    async function isAuthorizedToSell        (...args) {return await sgnAuthorizationManager.isAuthorizedToSell        (...args);}
    async function isAuthorizedToTransfer    (...args) {return await sgnAuthorizationManager.isAuthorizedToTransfer    (...args);}
    async function isAuthorizedToTransferFrom(...args) {return await sgnAuthorizationManager.isAuthorizedToTransferFrom(...args);}
});
