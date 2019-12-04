contract("SGNTokenUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let sgnTokenManager;
    let sagaExchanger;
    let sgnToken;

    const AMOUNT = 1000;

    const owner        = accounts[0];
    const sourceWallet = accounts[1];
    const targetWallet = accounts[2];
    const keeperWallet = accounts[3];
    const mintManager  = accounts[4];

    const nullAddress  = require("../utilities.js").address(0);
    const assertEqual  = require("../utilities.js").assertEqual;
    const catchRevert  = require("../exceptions.js").catchRevert;
    const denomination = require("./helpers/SGNToken.js").denomination;
    const mintedTokens = require("./helpers/SGNToken.js").mintedTokens;

    before(async function() {
        contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        sgnTokenManager             = await artifacts.require("SGNTokenManagerMockup"            ).new();
        sagaExchanger               = await artifacts.require("SagaExchangerMockup"              ).new();
        sgnToken                    = await artifacts.require("SGNToken"                         ).new(contractAddressLocatorProxy.address, sourceWallet);
    });

    describe("security assertion:", function() {
        before(async function() {
            await contractAddressLocatorProxy.set("ISGNTokenManager", sgnTokenManager.address);
            await contractAddressLocatorProxy.set("ISagaExchanger"  , sagaExchanger  .address);
            await contractAddressLocatorProxy.set("IMintManager"    , mintManager            );
        });
        it("function mintSgnVestedInDelay should abort with an error if called by a non-user", async function() {
            await catchRevert(sgnToken.mintSgnVestedInDelay(AMOUNT, {from: owner}));
        });
    });

    describe("functionality assertion:", function() {
        it("function convert should complete successfully", async function() {
            await assertEqual(sgnToken.convert(AMOUNT), AMOUNT);
        });
        it("function transfer should be valid in terms of balances", async function() {
            const sourceWalletSgnBalance = await sgnToken.balanceOf(sourceWallet);
            const targetWalletSgnBalance = await sgnToken.balanceOf(targetWallet);
            await sgnToken.transfer(targetWallet, AMOUNT, {from: sourceWallet});
            await assertEqual(sgnToken.balanceOf(sourceWallet), sourceWalletSgnBalance.minus(AMOUNT));
            await assertEqual(sgnToken.balanceOf(targetWallet), targetWalletSgnBalance.plus (AMOUNT));
        });
        it("function transferFrom should be valid in terms of balances", async function() {
            const sourceWalletSgnBalance = await sgnToken.balanceOf(sourceWallet);
            const targetWalletSgnBalance = await sgnToken.balanceOf(targetWallet);
            await sgnToken.approve(keeperWallet, AMOUNT, {from: sourceWallet});
            await sgnToken.transferFrom(sourceWallet, targetWallet, AMOUNT, {from: keeperWallet});
            await assertEqual(sgnToken.balanceOf(sourceWallet), sourceWalletSgnBalance.minus(AMOUNT));
            await assertEqual(sgnToken.balanceOf(targetWallet), targetWalletSgnBalance.plus (AMOUNT));
        });
        it("function mintSgnVestedInDelay should be valid in terms of balances", async function() {
            const tokenContractSgnBalance = await sgnToken.totalSupply();
            const sourceWalletSgnBalance  = await sgnToken.balanceOf(sourceWallet);
            const sgnMintedVestedInDelay  = await sgnToken.valueMintedAt(0);
            await sgnToken.mintSgnVestedInDelay(0, {from: mintManager});
            await assertEqual(sgnToken.totalSupply(), tokenContractSgnBalance.plus(sgnMintedVestedInDelay));
            await assertEqual(sgnToken.balanceOf(sourceWallet), sourceWalletSgnBalance .plus(sgnMintedVestedInDelay));
        });
    });

    describe("token-selling assertion:", function() {
        it("function transfer should be valid in terms of balances", async function() {
            await sagaExchanger.mintSgaForSgnHolders(AMOUNT);
            const tokenContractSgnBalance = await sgnToken.totalSupply();
            const sourceWalletSgnBalance  = await sgnToken.balanceOf(sourceWallet);
            const sourceWalletSgaBalance  = await sagaExchanger.balanceOf(sourceWallet);
            await sgnToken.transfer(sgnToken.address, AMOUNT, {from: sourceWallet});
            await assertEqual(sgnToken.totalSupply(), tokenContractSgnBalance.minus(AMOUNT));
            await assertEqual(sgnToken.balanceOf(sourceWallet), sourceWalletSgnBalance .minus(AMOUNT));
            await assertEqual(sagaExchanger.balanceOf(sourceWallet), sourceWalletSgaBalance .plus (AMOUNT));
        });
        it("function transferFrom should abort with an error", async function() {
            await sgnToken.approve(keeperWallet, AMOUNT, {from: sourceWallet});
            await catchRevert(sgnToken.transferFrom(sourceWallet, sgnToken.address, AMOUNT, {from: keeperWallet}));
            await sgnToken.approve(keeperWallet, 0, {from: sourceWallet});
        });
        it("function transfer should abort with an error if SagaExchanger is not connected", async function() {
            await contractAddressLocatorProxy.set("ISagaExchanger", nullAddress);
            await catchRevert(sgnToken.transfer(sgnToken.address, AMOUNT, {from: sourceWallet}));
            await contractAddressLocatorProxy.set("ISagaExchanger", sagaExchanger.address);
        });
    });

    describe("token-minting assertion:", function() {
        for (const [index, value] of Object.entries(mintedTokens)) {
            it(`mintedTokens[${index}] = ${value}`, async function() {
                const supply0   = await sgnToken.totalSupply();
                const response0 = await sgnToken.mintSgnVestedInDelay(index, {from: mintManager});
                const supply1   = await sgnToken.totalSupply();
                const response1 = await sgnToken.mintSgnVestedInDelay(index, {from: mintManager});
                const supply2   = await sgnToken.totalSupply();
                assert(supply2.equals(supply1) && supply1.equals(supply0.plus(`${value}e${denomination}`)));
            });
        }
    });
});
