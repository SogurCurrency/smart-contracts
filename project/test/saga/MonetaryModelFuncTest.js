contract("MonetaryModelFuncTest", function(accounts) {
    const transactionManager = accounts[1];

    const DIR    = "test/saga/helpers/sequences";
    const files  = require("fs").readdirSync(DIR);
    const unzip  = require("../utilities.js").unzip;
    const decode = require("../utilities.js").decode;

    const params = [
        {name: "input" , size: 256, indexed: false},
        {name: "output", size: 256, indexed: false},
    ];

    describe("functional assertion:", function() {
        let contractAddressLocatorProxy;
        let modelDataSource;
        let modelCalculator;
        let priceBandCalculator;
        let monetaryModel;
        before(async function() {
            contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxy").new();
            modelDataSource                  = await artifacts.require("ModelDataSource"                 ).new();
            modelCalculator             = await artifacts.require("ModelCalculator"            ).new();
            priceBandCalculator            = await artifacts.require("PriceBandCalculator"           ).new();
            monetaryModel                   = await artifacts.require("MonetaryModel"                  ).new(contractAddressLocatorProxy.address);
            await require("./helpers/ModelDataSource.js").initialize(modelDataSource);
        });
        for (let m = 0; m < files.length; m++) {
            describe(`file ${files[m]}:`, function() {
                const file = require("../../" + DIR + "/" + files[m]);
                let mintingPointTimersManager;
                let mintManager;
                let intervalIterator;
                let monetaryModelState;
                let contractAddressLocator;
                before(async function() {
                    mintingPointTimersManager            = await artifacts.require("MintingPointTimersManagerExposure"   ).new(contractAddressLocatorProxy.address, file.timeout);
                    mintManager            = await artifacts.require("MintManager"           ).new(contractAddressLocatorProxy.address);
                    intervalIterator       = await artifacts.require("IntervalIterator"      ).new(contractAddressLocatorProxy.address);
                    monetaryModelState         = await artifacts.require("MonetaryModelState"        ).new(contractAddressLocatorProxy.address);
                    contractAddressLocator = await artifacts.require("ContractAddressLocator").new(...unzip([
                        ["IModelDataSource"        , modelDataSource      .address],
                        ["IModelCalculator"   , modelCalculator .address],
                        ["IPriceBandCalculator"  , priceBandCalculator.address],
                        ["IMonetaryModel"         , monetaryModel       .address],
                        ["IMintingPointTimersManager"       , mintingPointTimersManager     .address],
                        ["IMintManager"       , mintManager     .address],
                        ["IIntervalIterator"  , intervalIterator.address],
                        ["IMonetaryModelState"    , monetaryModelState  .address],
                        ["ITransactionManager", transactionManager      ],
                    ]));
                    await contractAddressLocatorProxy.upgrade(contractAddressLocator.address);
                });
                for (let n = 0; n < file.sequence.length; n++) {
                    const func = file.sequence[n].func;
                    const input = web3.toBigNumber(file.sequence[n].input);
                    const output = web3.toBigNumber(file.sequence[n].output);
                    const elapsed = web3.toBigNumber(file.sequence[n].elapsed);
                    it(`${func}(${input.toFixed()}) = ${output.toFixed()}`, async function() {
                        await mintingPointTimersManager.jump(elapsed);
                        const response = await eval(func)(monetaryModel, input);
                        const decoded = decode(response, monetaryModel, 0, params);
                        const actual = web3.toBigNumber(decoded.output);
                        assert(actual.equals(output), `${func}(${input.toFixed()}) = ${actual.toFixed()}`);
                    });
                }
            });
        }
    });

    async function buy (monetaryModel, amount) {return await monetaryModel.buy (amount, {from: transactionManager});}
    async function sell(monetaryModel, amount) {return await monetaryModel.sell(amount, {from: transactionManager});}
});
