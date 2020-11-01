contract("TransferOnlySGATokenManagerUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let reserveManager;
    let transferOnlySGATokenManager;


    let sgrTokenAddress = accounts[4];

    const AMOUNT  = 1000;
    const BALANCE = 2000;

    const owner        = accounts[0];
    const senderWallet = accounts[1];
    const targetWallet = accounts[2];
    const sourceWallet = accounts[3];

    const nullAddress        = require("../utilities.js").address(0);
    const catchRevert        = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    beforeEach(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        reserveManager              = await artifacts.require("ReserveManagerMockup"             ).new();
        transferOnlySGATokenManager = await artifacts.require("TransferOnlySGATokenManager").new(contractAddressLocatorProxy.address);

        await contractAddressLocatorProxy.set("IReserveManager"         , reserveManager         .address);
        await contractAddressLocatorProxy.set("ISGRToken"            , sgrTokenAddress);
        await reserveManager.setState(senderWallet, BALANCE);
    });

    describe("disable methods assertion:", function() {
        it("function exchangeEthForSga should be disabled", async function() {
            await catchRevert(transferOnlySGATokenManager.exchangeEthForSga(senderWallet, AMOUNT));
        });

        it("function exchangeSgaForEth should be disabled", async function() {
            await catchRevert(transferOnlySGATokenManager.exchangeSgaForEth(senderWallet, AMOUNT));
        });

        it("function uponDeposit should be disabled", async function() {
            await catchRevert(transferOnlySGATokenManager.uponDeposit(senderWallet, BALANCE, AMOUNT));
        });

        it("function uponMintSgaForSgnHolders should be disabled", async function() {
            await catchRevert(transferOnlySGATokenManager.uponMintSgaForSgnHolders(AMOUNT));
        });

        it("function uponTransferSgaToSgnHolder should be disabled", async function() {
            await catchRevert(transferOnlySGATokenManager.uponTransferSgaToSgnHolder(targetWallet, AMOUNT));
        });

        it("function postTransferEthToSgaHolder should be disabled", async function() {
            await catchRevert(transferOnlySGATokenManager.postTransferEthToSgaHolder(targetWallet, AMOUNT, true));
        });

        it("function getDepositParams should be disabled", async function() {
            await catchRevert(transferOnlySGATokenManager.getDepositParams());
        });

        it("function getWithdrawParams should be disabled", async function() {
            await catchRevert(transferOnlySGATokenManager.getWithdrawParams());
        });
    });

    describe("function uponWithdraw:", function() {
        it("should complete successfully", async function() {
            await verifyEvent(transferOnlySGATokenManager.uponWithdraw(senderWallet, BALANCE), "WithdrawCompleted");
        });

        it("should abort with an error if the reserve wallet is wrong", async function() {
            await reserveManager.setState(nullAddress, BALANCE);
            await catchRevert(transferOnlySGATokenManager.uponWithdraw(senderWallet, BALANCE));
        });
    });

    describe("function uponTransfer:", function() {
        it("should complete successfully", async function() {
            await transferOnlySGATokenManager.uponTransfer(senderWallet, targetWallet, AMOUNT);
        });

        it("should abort with an error if called with SGR token contract address as destination", async function() {
            await catchRevert(transferOnlySGATokenManager.uponTransfer(senderWallet, sgrTokenAddress, AMOUNT));
        });
    });

    describe("function uponTransferFrom:", function() {
        it("should complete successfully", async function() {
          await transferOnlySGATokenManager.uponTransferFrom(senderWallet, sourceWallet, targetWallet, AMOUNT);
        });

        it("should abort with an error if called with SGR token contract address as destination", async function() {
          await catchRevert(transferOnlySGATokenManager.uponTransferFrom(senderWallet, sourceWallet, sgrTokenAddress, AMOUNT));
        });
    });

    async function verifyEvent(promise, expected) {
        const response = await promise;
        const logs     = response.logs;
        const actual   = logs && logs[0] ? logs[0].event : "";
        assert(actual == expected, `expected = ${expected}, actual = ${actual}`);
    }
});
