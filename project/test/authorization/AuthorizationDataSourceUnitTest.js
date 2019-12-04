contract("AuthorizationDataSourceUnitTest", function(accounts) {
    let authorizationDataSource;

    const SEQUENCE_NUM  = 1000;
    const IS_AUTHORIZED = true;
    const ACTION_ROLE   = 2000;
    const TRADE_LIMIT   = 3000;
    const TRADE_CLASS   = 4000;

    const owner  = accounts[0];
    const admin  = accounts[1];
    const wallet = accounts[2];

    const wallets = [];
    for (let n = 1; n <= 32; n++)
        wallets.push(require("../utilities.js").address(n));

    const nullAddress = require("../utilities.js").address(0);
    const assertEqual = require("../utilities.js").assertEqual;
    const catchRevert = require("../exceptions.js").catchRevert;

    before(async function() {
        authorizationDataSource = await artifacts.require("AuthorizationDataSource").new();
    });

    describe("security assertion:", function() {
        before(async function() {
            await authorizationDataSource.accept(admin, {from: owner});
        });
        it("function upsertOne should abort with an error if called by a non-administrator", async function() {
            await catchRevert(authorizationDataSource.upsertOne(wallet, SEQUENCE_NUM, IS_AUTHORIZED, ACTION_ROLE, TRADE_LIMIT, TRADE_CLASS, {from: owner}));
        });
        it("function removeOne should abort with an error if called by a non-administrator", async function() {
            await catchRevert(authorizationDataSource.removeOne(wallet, {from: owner}));
        });
        it("function upsertAll should abort with an error if called by a non-administrator", async function() {
            await catchRevert(authorizationDataSource.upsertAll([wallet], SEQUENCE_NUM, IS_AUTHORIZED, ACTION_ROLE, TRADE_LIMIT, TRADE_CLASS, {from: owner}));
        });
        it("function removeAll should abort with an error if called by a non-administrator", async function() {
            await catchRevert(authorizationDataSource.removeAll([wallet], {from: owner}));
        });
        it("function upsertOne should abort with an error if the input wallet is invalid", async function() {
            await catchRevert(authorizationDataSource.upsertOne(nullAddress, SEQUENCE_NUM, IS_AUTHORIZED, ACTION_ROLE, TRADE_LIMIT, TRADE_CLASS, {from: admin}));
        });
        it("function removeOne should abort with an error if the input wallet is invalid", async function() {
            await catchRevert(authorizationDataSource.removeOne(nullAddress, {from: admin}));
        });
        it("function upsertAll should abort with an error if an input wallet is invalid", async function() {
            await catchRevert(authorizationDataSource.upsertAll([nullAddress], SEQUENCE_NUM, IS_AUTHORIZED, ACTION_ROLE, TRADE_LIMIT, TRADE_CLASS, {from: admin}));
        });
        it("function removeAll should abort with an error if an input wallet is invalid", async function() {
            await catchRevert(authorizationDataSource.removeAll([nullAddress], {from: admin}));
        });
        after(async function() {
            await authorizationDataSource.accept(owner, {from: owner});
        });
    });

    describe("functionality assertion:", function() {
        it("function upsertOne should insert the wallet", async function() {
            const response = await authorizationDataSource.upsertOne(wallet, SEQUENCE_NUM, IS_AUTHORIZED, ACTION_ROLE, TRADE_LIMIT, TRADE_CLASS);
            await verify(response.logs[0], "WalletSaved", wallet, IS_AUTHORIZED, ACTION_ROLE, TRADE_LIMIT, TRADE_CLASS);
            await assertEqual(authorizationDataSource.walletCount(), 1);
        });
        it("function upsertOne should update the wallet", async function() {
            const response = await authorizationDataSource.upsertOne(wallet, SEQUENCE_NUM + 1, IS_AUTHORIZED, ACTION_ROLE, TRADE_LIMIT, TRADE_CLASS);
            await verify(response.logs[0], "WalletSaved", wallet, IS_AUTHORIZED, ACTION_ROLE, TRADE_LIMIT, TRADE_CLASS);
            await assertEqual(authorizationDataSource.walletCount(), 1);
        });
        it("function upsertOne should not update the wallet", async function() {
            const response = await authorizationDataSource.upsertOne(wallet, SEQUENCE_NUM + 1, !IS_AUTHORIZED, ACTION_ROLE + 1, TRADE_LIMIT + 1, TRADE_CLASS + 1);
            await verify(response.logs[0], "WalletNotSaved", wallet, IS_AUTHORIZED, ACTION_ROLE, TRADE_LIMIT, TRADE_CLASS);
            await assertEqual(authorizationDataSource.walletCount(), 1);
        });
        it("function removeOne should remove the wallet", async function() {
            const response = await authorizationDataSource.removeOne(wallet);
            await verify(response.logs[0], "WalletDeleted", wallet, false, 0, 0, 0);
            await assertEqual(authorizationDataSource.walletCount(), 0);
        });
        it("function removeOne should not remove the wallet", async function() {
            const response = await authorizationDataSource.removeOne(wallet);
            await verify(response.logs[0], "WalletNotDeleted", wallet, false, 0, 0, 0);
            await assertEqual(authorizationDataSource.walletCount(), 0);
        });
        it("function upsertAll should insert the wallets", async function() {
            const response = await authorizationDataSource.upsertAll(wallets, SEQUENCE_NUM, IS_AUTHORIZED, ACTION_ROLE, TRADE_LIMIT, TRADE_CLASS);
            for (let i = 0; i < wallets.length; i++)
                await verify(response.logs[i], "WalletSaved", wallets[i], IS_AUTHORIZED, ACTION_ROLE, TRADE_LIMIT, TRADE_CLASS);
            await assertEqual(authorizationDataSource.walletCount(), wallets.length);
        });
        it("function upsertAll should update the wallets", async function() {
            const response = await authorizationDataSource.upsertAll(wallets, SEQUENCE_NUM + 1, IS_AUTHORIZED, ACTION_ROLE, TRADE_LIMIT, TRADE_CLASS);
            for (let i = 0; i < wallets.length; i++)
                await verify(response.logs[i], "WalletSaved", wallets[i], IS_AUTHORIZED, ACTION_ROLE, TRADE_LIMIT, TRADE_CLASS);
            await assertEqual(authorizationDataSource.walletCount(), wallets.length);
        });
        it("function upsertAll should not update the wallets", async function() {
            const response = await authorizationDataSource.upsertAll(wallets, SEQUENCE_NUM + 1, !IS_AUTHORIZED, ACTION_ROLE + 1, TRADE_LIMIT + 1, TRADE_CLASS + 1);
            for (let i = 0; i < wallets.length; i++)
                await verify(response.logs[i], "WalletNotSaved", wallets[i], IS_AUTHORIZED, ACTION_ROLE, TRADE_LIMIT, TRADE_CLASS);
            await assertEqual(authorizationDataSource.walletCount(), wallets.length);
        });
        it("function removeAll should remove the wallets", async function() {
            const response = await authorizationDataSource.removeAll(wallets);
            for (let i = 0; i < wallets.length; i++)
                await verify(response.logs[i], "WalletDeleted", wallets[i], false, 0, 0, 0);
            await assertEqual(authorizationDataSource.walletCount(), 0);
        });
        it("function removeAll should not remove the wallets", async function() {
            const response = await authorizationDataSource.removeAll(wallets);
            for (let i = 0; i < wallets.length; i++)
                await verify(response.logs[i], "WalletNotDeleted", wallets[i], false, 0, 0, 0);
            await assertEqual(authorizationDataSource.walletCount(), 0);
        });
    });

    async function verify(log, event, wallet, isWhitelisted, actionRole, tradeLimit, tradeClass) {
        const _event                       = log.event;
        const _wallet                      = log.args._wallet;
        const [_isWhitelisted, _actionRole] = await authorizationDataSource.getAuthorizedActionRole(wallet);
        const [_tradeLimit  , _tradeClass] = await authorizationDataSource.getTradeLimitAndClass  (wallet);
        const expected = `event: ${ event}, wallet: ${ wallet}, isWhitelisted: ${ isWhitelisted}, actionRole: ${ actionRole}, tradeLimit: ${ tradeLimit}, tradeClass: ${ tradeClass}`;
        const actual   = `event: ${_event}, wallet: ${_wallet}, isWhitelisted: ${_isWhitelisted}, actionRole: ${_actionRole}, tradeLimit: ${_tradeLimit}, tradeClass: ${_tradeClass}`;
        assert(actual == expected, `expected = ${expected}; actual = ${actual}`);
    }
});
