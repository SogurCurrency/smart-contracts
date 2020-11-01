// See <https://www.npmjs.com/package/solidity-coverage#options>
module.exports = {
    port:           8555,
    norpc:          true,
    skipFiles: ["authorization/helpers", "contract_address_locator/helpers", "migrations/AuthorizationDataSourceMigration.sol", "sogur/helpers", "voting/helpers", "saga-genesis/helpers", "utils/helpers", "utils/migrations", "wallet_trading_limiter/helpers"],
    testCommand:    "node ../../node_modules/truffle/build/cli.bundled.js test --network=coverage",
    compileCommand: "node ../../node_modules/truffle/build/cli.bundled.js compile --network=coverage",
};
