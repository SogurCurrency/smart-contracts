// See <http://truffleframework.com/docs/advanced/configuration>
module.exports = {
    networks: {
        development: {
            host:       "127.0.0.1",
            port:       8545,
            network_id: "*",          // Match any network id
            gasPrice:   100000000000, // Gas price used for deploys
            gas:        8000000,      // Gas limit used for deploys
        },
        production: {
            host:       "127.0.0.1",
            port:       8545,
            network_id: "*",          // Match any network id
            gasPrice:   100000000000, // Gas price used for deploys
            gas:        6721975,      // Gas limit used for deploys
        },
        coverage: {     // See <https://www.npmjs.com/package/solidity-coverage#network-configuration>
            host:       "127.0.0.1",
            port:       8555,             // Also in .solcover.js
            network_id: "*",              // Match any network id
            gasPrice:   0x1,              // Gas price used for deploys
            gas:        0x1fffffffffffff, // Gas limit used for deploys
        },
    },
    mocha: {
        enableTimeouts: false,
        useColors:      true,
        bail:           true,   // Abort after first test failure
        reporter:       "list", // See <https://mochajs.org/#reporters>
    },
    solc: {
        optimizer: {
            enabled: true,
            runs:    6000,
        },
    },
};
