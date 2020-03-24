contract("SGATokenManagerUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let sgaAuthorizationManager;
    let transactionManager;
    let walletsTradingLimiterMockup;
    let reserveManager;
    let paymentManager;
    let redButton;
    let sgaTokenManager;

    const AMOUNT  = 1000;
    const BALANCE = 2000;

    const owner        = accounts[0];
    const senderWallet = accounts[1];
    const targetWallet = accounts[2];
    const sourceWallet = accounts[3];

    const nullAddress        = require("../utilities.js").address(0);
    const catchRevert        = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        sgaAuthorizationManager     = await artifacts.require("SGAAuthorizationManagerMockup"    ).new();
        transactionManager          = await artifacts.require("TransactionManagerMockup"         ).new();
        walletsTradingLimiterMockup              = await artifacts.require("WalletsTradingLimiterMockup"             ).new();
        reserveManager              = await artifacts.require("ReserveManagerMockup"             ).new();
        paymentManager                 = await artifacts.require("PaymentManagerMockup"                ).new();
        redButton                   = await artifacts.require("RedButtonMockup"                  ).new();
        sgaTokenManager             = await artifacts.require("SGATokenManager"                  ).new(contractAddressLocatorProxy.address);
    });

    describe("security assertion:", function() {
        before(async function() {
            await contractAddressLocatorProxy.set("ISGAAuthorizationManager", sgaAuthorizationManager.address);
            await contractAddressLocatorProxy.set("ITransactionManager"     , transactionManager     .address);
            await contractAddressLocatorProxy.set("SellWalletsTLSGATokenManager"         , walletsTradingLimiterMockup         .address);
            await contractAddressLocatorProxy.set("BuyWalletsTLSGATokenManager"         , walletsTradingLimiterMockup         .address);
            await contractAddressLocatorProxy.set("IReserveManager"         , reserveManager         .address);
            await contractAddressLocatorProxy.set("IPaymentManager"            , paymentManager            .address);
            await contractAddressLocatorProxy.set("IRedButton"              , redButton              .address);
            await sgaAuthorizationManager.setState(true);
            await reserveManager.setState(senderWallet, BALANCE);
        });
        it("function exchangeEthForSga should abort with an error if called by a non-user", async function() {
            await catchRevert(sgaTokenManager.exchangeEthForSga(senderWallet, AMOUNT, {from: owner}));
        });
        it("function exchangeSgaForEth should abort with an error if called by a non-user", async function() {
            await catchRevert(sgaTokenManager.exchangeSgaForEth(senderWallet, AMOUNT, {from: owner}));
        });
        it("function uponTransfer should abort with an error if called by a non-user", async function() {
            await catchRevert(sgaTokenManager.uponTransfer(senderWallet, targetWallet, AMOUNT, {from: owner}));
        });
        it("function uponTransferFrom should abort with an error if called by a non-user", async function() {
            await catchRevert(sgaTokenManager.uponTransferFrom(senderWallet, sourceWallet, targetWallet, AMOUNT, {from: owner}));
        });
        it("function uponDeposit should abort with an error if called by a non-user", async function() {
            await catchRevert(sgaTokenManager.uponDeposit(senderWallet, BALANCE, AMOUNT, {from: owner}));
        });
        it("function uponWithdraw should abort with an error if called by a non-user", async function() {
            await catchRevert(sgaTokenManager.uponWithdraw(senderWallet, BALANCE, {from: owner}));
        });
        it("function uponMintSgaForSgnHolders should abort with an error if called by a non-user", async function() {
            await catchRevert(sgaTokenManager.uponMintSgaForSgnHolders(AMOUNT, {from: owner}));
        });
        it("function uponTransferSgaToSgnHolder should abort with an error if called by a non-user", async function() {
            await catchRevert(sgaTokenManager.uponTransferSgaToSgnHolder(targetWallet, AMOUNT, {from: owner}));
        });
        it("function postTransferEthToSgaHolder should abort with an error if called by a non-user", async function() {
            await catchRevert(sgaTokenManager.postTransferEthToSgaHolder(targetWallet, AMOUNT, true, {from: owner}));
        });
        it("function getDepositParams should abort with an error if called by a non-user", async function() {
            await catchRevert(sgaTokenManager.getDepositParams({from: owner}));
        });
        it("function getWithdrawParams should abort with an error if called by a non-user", async function() {
            await catchRevert(sgaTokenManager.getWithdrawParams({from: owner}));
        });
        after(async function() {
            await contractAddressLocatorProxy.set("ISGAToken", owner);
        });
    });

    describe("functionality assertion:", function() {
        beforeEach(async function() {
            await walletsTradingLimiterMockup.setPass(true);
        });
        it("function exchangeEthForSga should complete successfully", async function() {
            await verifyEvent(sgaTokenManager.exchangeEthForSga(senderWallet, AMOUNT), "ExchangeEthForSgaCompleted");
        });
        it("function exchangeEthForSga should abort if exceed limit", async function() {
            await walletsTradingLimiterMockup.setPass(false);
            await catchRevert(sgaTokenManager.exchangeEthForSga(senderWallet, AMOUNT));
        });
        it("function exchangeSgaForEth should complete successfully", async function() {
            await verifyEvent(sgaTokenManager.exchangeSgaForEth(senderWallet, AMOUNT), "ExchangeSgaForEthCompleted");
        });
        it("function exchangeSgaForEth should abort if exceed limit", async function() {
                    await walletsTradingLimiterMockup.setPass(false);
                    await catchRevert(sgaTokenManager.exchangeSgaForEth(senderWallet, AMOUNT));
        });
        it("function uponTransfer should complete successfully", async function() {
            await verifyEvent(sgaTokenManager.uponTransfer(senderWallet, targetWallet, AMOUNT), "");
        });
        it("function uponTransferFrom should complete successfully", async function() {
            await verifyEvent(sgaTokenManager.uponTransferFrom(senderWallet, sourceWallet, targetWallet, AMOUNT), "");
        });
        it("function uponDeposit should complete successfully", async function() {
            await verifyEvent(sgaTokenManager.uponDeposit(senderWallet, BALANCE, AMOUNT), "DepositCompleted");
        });
        it("function uponWithdraw should complete successfully", async function() {
            await verifyEvent(sgaTokenManager.uponWithdraw(senderWallet, BALANCE), "WithdrawCompleted");
        });
        it("function uponMintSgaForSgnHolders should complete successfully", async function() {
            await verifyEvent(sgaTokenManager.uponMintSgaForSgnHolders(AMOUNT), "MintSgaForSgnHoldersCompleted");
        });
        it("function uponTransferSgaToSgnHolder should complete successfully", async function() {
            await verifyEvent(sgaTokenManager.uponTransferSgaToSgnHolder(targetWallet, AMOUNT), "TransferSgaToSgnHolderCompleted");
        });
        it("function postTransferEthToSgaHolder should complete successfully", async function() {
            await verifyEvent(sgaTokenManager.postTransferEthToSgaHolder(targetWallet, AMOUNT, true), "TransferEthToSgaHolderCompleted");
        });
        it("function getDepositParams should complete successfully", async function() {
            await verifyEvent(sgaTokenManager.getDepositParams(), "");
        });
        it("function getWithdrawParams should complete successfully", async function() {
            await verifyEvent(sgaTokenManager.getWithdrawParams(), "");
        });
    });

    describe("token-selling assertion:", function() {
        it("function exchangeSgaForEth should complete successfully if the amount is less than the balance", async function() {
            await sgaTokenManager.exchangeSgaForEth(senderWallet, (await web3.eth.getBalance(owner)).minus(1), {from: owner});
        });
        it("function exchangeSgaForEth should complete successfully if the amount is equal to the balance", async function() {
            await sgaTokenManager.exchangeSgaForEth(senderWallet, (await web3.eth.getBalance(owner)).times(1), {from: owner});
        });
        it("function exchangeSgaForEth should complete successfully if the amount is more than the balance", async function() {
            await sgaTokenManager.exchangeSgaForEth(senderWallet, (await web3.eth.getBalance(owner)).plus(1), {from: owner});
        });
    });

    describe("authorization assertion:", function() {
        before(async function() {
            await sgaAuthorizationManager.setState(false);
        });
        it("function exchangeEthForSga should abort with an error if unauthorized", async function() {
            await catchRevert(sgaTokenManager.exchangeEthForSga(senderWallet, AMOUNT));
        });
        it("function exchangeSgaForEth should abort with an error if unauthorized", async function() {
            await catchRevert(sgaTokenManager.exchangeSgaForEth(senderWallet, AMOUNT));
        });
        it("function uponWithdraw should abort with an error if unauthorized", async function() {
            await catchRevert(sgaTokenManager.uponWithdraw(senderWallet, BALANCE));
        });
        after(async function() {
            await sgaAuthorizationManager.setState(true);
        });
    });

    describe("reserve-wallet assertion:", function() {
        before(async function() {
            await reserveManager.setState(nullAddress, BALANCE);
        });
        it("function uponDeposit should abort with an error if the reserve wallet is wrong", async function() {
            await catchRevert(sgaTokenManager.uponDeposit(senderWallet, BALANCE, AMOUNT));
        });
        it("function uponWithdraw should abort with an error if the reserve wallet is wrong", async function() {
            await catchRevert(sgaTokenManager.uponWithdraw(senderWallet, BALANCE));
        });
        after(async function() {
            await reserveManager.setState(senderWallet, BALANCE);
        });
    });

    describe("reserve-amount assertion:", function() {
        before(async function() {
            await reserveManager.setState(senderWallet, 0);
        });
        it("function uponDeposit should abort with an error if the reserve amount is wrong", async function() {
            await catchRevert(sgaTokenManager.uponDeposit(senderWallet, BALANCE, AMOUNT));
        });
        it("function uponWithdraw should abort with an error if the reserve amount is wrong", async function() {
            await catchRevert(sgaTokenManager.uponWithdraw(senderWallet, BALANCE));
        });
        after(async function() {
            await reserveManager.setState(senderWallet, BALANCE);
        });
    });

    describe("red-button assertion:", function() {
        before(async function() {
            await redButton.setEnabled(true);
        });
        it("function exchangeEthForSga should abort with an error if called when red-button is enabled", async function() {
            await catchRevert(sgaTokenManager.exchangeEthForSga(senderWallet, AMOUNT));
        });
        it("function exchangeSgaForEth should abort with an error if called when red-button is enabled", async function() {
            await catchRevert(sgaTokenManager.exchangeSgaForEth(senderWallet, AMOUNT));
        });
        it("function uponTransferSgaToSgnHolder should abort with an error if called when red-button is enabled", async function() {
            await catchRevert(sgaTokenManager.uponTransferSgaToSgnHolder(targetWallet, AMOUNT));
        });
        after(async function() {
            await redButton.setEnabled(false);
        });
    });

    describe("payment-handling assertion:", function() {
        before(async function() {
            await paymentManager.setError(true);
        });
        it("function exchangeSgaForEth should abort with an error if payment-calculation is erroneous", async function() {
            await catchInvalidOpcode(sgaTokenManager.exchangeSgaForEth(senderWallet, AMOUNT));
        });
        after(async function() {
            await paymentManager.setError(false);
        });
    });

    async function verifyEvent(promise, expected) {
        const response = await promise;
        const logs     = response.logs;
        const actual   = logs && logs[0] ? logs[0].event : "";
        assert(actual == expected, `expected = ${expected}, actual = ${actual}`);
    }
});
