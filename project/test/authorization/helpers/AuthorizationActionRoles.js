module.exports.Flag = {
    BuySgr          : 0,
    SellSgr         : 1,
    SellSgn         : 2,
    ReceiveSgn      : 3,
    TransferSgn     : 4,
    TransferFromSgn : 5,
};

module.exports.test = function(set, wallets, func, flags) {
    for (let i = 0; i < 2 ** flags.length; i++) {
        it(`function ${func.name}, combination ${i}`, async function() {
            for (let j = 0; j < flags.length; j++) {
                const actionRole = 2 ** flags[j] * ((i >> j) & 1);
                await set(wallets[j], true, actionRole, 0, 0, 0);
            }

            const expected = i == 2 ** flags.length - 1;

            const actual   = await func(...wallets.slice(0, flags.length));
            assert(actual == expected, `expected = ${expected}, actual = ${actual}`);
        });
    }
};
