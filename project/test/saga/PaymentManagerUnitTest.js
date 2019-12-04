contract("PaymentManagerUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let ethConverter;
    let paymentQueue;
    let paymentManager;
    let paymentManagerUser;
    let sgaAuthorizationManager;

    const owner   = accounts[0];
    const nonOwner   = accounts[1];
    const wallets = accounts.slice(1);

    const AMOUNT  = web3.toBigNumber(web3.toWei("1000"));
    const EPSILON = web3.toBigNumber(web3.toWei("0.01"));

    const COMBINATIONS = [
        ["0.0", "7.0"                     ],
        ["0.2", "6.8"                     ],
        ["1.0", "6.0"                     ],
        ["0.0", "5.8", "1.2"              ],
        ["0.0", "6.0", "1.0"              ],
        ["0.2", "5.0", "1.8"              ],
        ["0.2", "5.4", "1.4"              ],
        ["0.2", "5.8", "1.0"              ],
        ["1.0", "4.8", "1.2"              ],
        ["1.0", "5.0", "1.0"              ],
        ["1.5", "4.0", "1.5"              ],
        ["1.2", "4.0", "1.0", "0.8"       ],
        ["1.2", "4.2", "1.2", "0.4"       ],
        ["1.5", "2.0", "2.0", "1.5"       ],
        ["1.0", "1.2", "1.4", "1.6", "1.8"],
    ];

    const table = [];
    for (const combination of COMBINATIONS) {
        const row = [];
        let numOfWalletsSettled = web3.toBigNumber(0);
        for (const value of combination) {
            row.push([numOfWalletsSettled, web3.toBigNumber(value)]);
            numOfWalletsSettled = numOfWalletsSettled.plus(web3.toBigNumber(value));
        }
        assert(numOfWalletsSettled.equals(wallets.length), `${combination.join(" + ")} != ${wallets.length}`);
        table.push(row);
    }

    const catchRevert = require("../exceptions.js").catchRevert;

    before(async function() {
        contractAddressLocatorProxy    = await artifacts.require("ContractAddressLocatorProxyMockup").new();
        ethConverter                   = await artifacts.require("ETHConverterMockup"       ).new();
        paymentQueue                   = await artifacts.require("PaymentQueueMockup"                  ).new(contractAddressLocatorProxy.address);
        paymentManager                 = await artifacts.require("PaymentManager"                      ).new(contractAddressLocatorProxy.address);
        paymentManagerUser             = await artifacts.require("PaymentManagerUser"                  ).new(paymentManager.address);
        sgaAuthorizationManager        = await artifacts.require("SGAAuthorizationManagerMockup"    ).new();

        await sgaAuthorizationManager.setState(true);
    });

    describe("security assertion:", function() {
        before(async function() {
            await contractAddressLocatorProxy.set("IETHConverter", ethConverter.address);
            await contractAddressLocatorProxy.set("IPaymentQueue"           , paymentQueue           .address);
            await contractAddressLocatorProxy.set("IPaymentHandler"         , paymentManagerUser     .address);
            await contractAddressLocatorProxy.set("ISGATokenManager"     , paymentManagerUser     .address);
            await contractAddressLocatorProxy.set("ISGAAuthorizationManager", sgaAuthorizationManager.address);
        });
        it("function registerDifferPayment should abort with an error if called by a non-user", async function() {
            await catchRevert(paymentManager.registerDifferPayment(owner, 0, {from: owner}));
        });

    });

    describe("function computeDifferPayment when the payment-queue is not empty:", function() {
        before(async function() {
            await paymentQueue.addPayment(owner, 0);
        });
        for (let ethAmount = 0; ethAmount < 5; ethAmount++) {
            for (let ethBalance = 0; ethBalance < 5; ethBalance++) {
                it(`ethAmount = ${ethAmount}, ethBalance = ${ethBalance}`, async function() {
                    const expected = ethAmount;
                    const actual   = await paymentManager.computeDifferPayment(ethAmount, ethBalance);
                    assert(actual.equals(expected), `expected = ${expected}, actual = ${actual}`);
                });
            }
        }
    });

    describe("function computeDifferPayment when the payment-queue is empty:", function() {
        before(async function() {
            await paymentQueue.removePayment();
        });
        for (let ethAmount = 0; ethAmount < 5; ethAmount++) {
            for (let ethBalance = 0; ethBalance < 5; ethBalance++) {
                it(`ethAmount = ${ethAmount}, ethBalance = ${ethBalance}`, async function() {
                    const expected = Math.max(ethAmount - ethBalance, 0);
                    const actual   = await paymentManager.computeDifferPayment(ethAmount, ethBalance);
                    assert(actual.equals(expected), `expected = ${expected}, actual = ${actual}`);
                });
            }
        }
    });

    describe("function settlePayments with maximum 1 payment to handle:", function() {
        before(async function() {
            for (let i = 0; i < 2; i++)
                await paymentQueue.addPayment(owner, 0);
        });
        for (let i = 0; i < 3; i++) {
            it(`number of payments in the payment-queue = ${2 - i}`, async function() {
                const before   = await paymentQueue.getNumOfPayments();
                const response = await paymentManager.settlePayments(1);
                const after    = await paymentQueue.getNumOfPayments();
                let expected   = `before: ${2 - i }, after: ${Math.max(1 - i, 0)}, event: ${i < 2 ? "PaymentSettled"          : []           }`;
                let actual     = `before: ${before}, after: ${after             }, event: ${i < 2 ? response.logs[0].event : response.logs}`;
                assert(actual == expected, `expected = ${expected}; actual = ${actual}`);
            });
        }
    });

    for (let i = 0; i < table.length; i++) {
        describe(`combination ${i}`, function() {
            const initialBalances = {};
            before(async function() {
                for (const wallet of wallets) {
                    await web3.eth.sendTransaction({from: wallet, to: owner, value: AMOUNT});
                    initialBalances[wallet] = web3.eth.getBalance(wallet);
                }
            });
            for (let j = 0; j < table[i].length; j++) {
                it(`test ${j}`, async function() {
                    await test(j == 0, table[i][j][0], table[i][j][1], initialBalances);
                });
            }
        });
    }

    async function test(firstTime, numOfWalletsSettled, numOfWalletsToSettle, initialBalances) {
        await web3.eth.sendTransaction({from: owner, to: paymentManagerUser.address, value: AMOUNT.times(numOfWalletsToSettle)});

        if (firstTime)
            for (const wallet of wallets)
                await paymentManagerUser.sell(wallet, AMOUNT);
        else
            await paymentManager.settlePayments(wallets.length);

        const total   = numOfWalletsToSettle.plus(numOfWalletsSettled);
        const amounts = wallets.map((x, i) => AMOUNT.times(web3.BigNumber.min(web3.BigNumber.max(total.minus(i), 0), 1)));

        const expectedNumOfPayments = Math.ceil(wallets.length - total.toNumber());
        const actualNumOfPayments   = await paymentQueue.getNumOfPayments();
        assert(actualNumOfPayments.equals(expectedNumOfPayments), `expectedNumOfPayments = ${expectedNumOfPayments}, actualNumOfPayments = ${actualNumOfPayments}`);

        for (let i = wallets.length - expectedNumOfPayments; i < wallets.length; i++) {
            const [expectedWallet, expectedAmount] = [wallets[i], AMOUNT.minus(amounts[i])];
            const [actualWallet  , actualAmount  ] = await paymentQueue.getPayment(i - wallets.length + expectedNumOfPayments);
            assert(actualWallet   ==   expectedWallet , `expectedWallet = ${expectedWallet          }, actualWallet = ${actualWallet          }`);
            assert(actualAmount.equals(expectedAmount), `expectedAmount = ${expectedAmount.toFixed()}, actualAmount = ${actualAmount.toFixed()}`);
        }

        for (let i = 0; i < wallets.length; i++) {
            const expected = amounts[i];
            const actual   = web3.eth.getBalance(wallets[i]).minus(initialBalances[wallets[i]]);
            assert(actual.minus(expected).abs().lessThan(EPSILON), `expected = ${expected.toFixed()}, actual = ${actual.toFixed()}`);
        }
    }

    describe("function getNumOfPayments:", function() {
      beforeEach(async function() {
            contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
            ethConverter        = await artifacts.require("ETHConverterMockup"       ).new();
            paymentQueue                   = await artifacts.require("PaymentQueueMockup"                  ).new(contractAddressLocatorProxy.address);
            paymentManager                 = await artifacts.require("PaymentManager"                      ).new(contractAddressLocatorProxy.address);
            paymentManagerUser             = await artifacts.require("PaymentManagerUser"                  ).new(paymentManager.address);
            await contractAddressLocatorProxy.set("IETHConverter", ethConverter.address);
            await contractAddressLocatorProxy.set("IPaymentQueue"           , paymentQueue           .address);
            await contractAddressLocatorProxy.set("IPaymentManager"         , paymentManager         .address);
            await contractAddressLocatorProxy.set("IPaymentHandler"         , paymentManagerUser     .address);
            await contractAddressLocatorProxy.set("ISGATokenManager"     , paymentManagerUser     .address);
      });
      it("should return the payment queue result", async function() {
            await paymentQueue.setNumOfPayments(0, true);
            assert.equal(await paymentManager.getNumOfPayments(), 0);

            await paymentQueue.setNumOfPayments(5, true);
            assert.equal(await paymentManager.getNumOfPayments(), 5);
      });
    });
    describe("function getPaymentsSum:", function() {
      beforeEach(async function() {
            contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
            ethConverter        = await artifacts.require("ETHConverterMockup"       ).new();
            paymentQueue                   = await artifacts.require("PaymentQueueMockup"                  ).new(contractAddressLocatorProxy.address);
            paymentManager                 = await artifacts.require("PaymentManager"                      ).new(contractAddressLocatorProxy.address);
            paymentManagerUser             = await artifacts.require("PaymentManagerUser"                  ).new(paymentManager.address);
            await contractAddressLocatorProxy.set("IETHConverter", ethConverter.address);
            await contractAddressLocatorProxy.set("IPaymentQueue"           , paymentQueue           .address);
            await contractAddressLocatorProxy.set("IPaymentManager"         , paymentManager         .address);
            await contractAddressLocatorProxy.set("IPaymentHandler"         , paymentManagerUser     .address);
            await contractAddressLocatorProxy.set("ISGATokenManager"     , paymentManagerUser     .address);
      });
      it("should return the payment queue result", async function() {
            await paymentQueue.setPaymentsSum(0);
            assert.equal(await paymentManager.getPaymentsSum(), 0);

            await paymentQueue.setPaymentsSum(1500);
            assert.equal(await paymentManager.getPaymentsSum(), 1500);
      });
    });
    describe("function setMaxNumOfPaymentsLimit:", function() {
      before(async function() {
            contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
            ethConverter        = await artifacts.require("ETHConverterMockup"       ).new();
            paymentQueue                   = await artifacts.require("PaymentQueueMockup"                  ).new(contractAddressLocatorProxy.address);
            paymentManager                 = await artifacts.require("PaymentManager"                      ).new(contractAddressLocatorProxy.address);
            paymentManagerUser             = await artifacts.require("PaymentManagerUser"                  ).new(paymentManager.address);
            await contractAddressLocatorProxy.set("IETHConverter", ethConverter.address);
            await contractAddressLocatorProxy.set("IPaymentQueue"           , paymentQueue           .address);
            await contractAddressLocatorProxy.set("IPaymentManager"         , paymentManager         .address);
            await contractAddressLocatorProxy.set("IPaymentHandler"         , paymentManagerUser     .address);
            await contractAddressLocatorProxy.set("ISGATokenManager"     , paymentManagerUser     .address);
      });

      it("should abort with an error if called by a non-owner", async function() {
            await catchRevert(paymentManager.setMaxNumOfPaymentsLimit(2, {from: nonOwner}));
      });

      it("should abort with an error if called with value 0", async function() {
            await catchRevert(paymentManager.setMaxNumOfPaymentsLimit(0, {from: owner}));
      });
    });


    describe("function settlePayments:", function() {

      beforeEach(async function() {
            contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
            ethConverter        = await artifacts.require("ETHConverterMockup"       ).new();
            paymentQueue                   = await artifacts.require("PaymentQueueMockup"                  ).new(contractAddressLocatorProxy.address);
            paymentManager                 = await artifacts.require("PaymentManager"                      ).new(contractAddressLocatorProxy.address);
            paymentManagerUser             = await artifacts.require("PaymentManagerUser"                  ).new(paymentManager.address);
            sgaAuthorizationManager        = await artifacts.require("SGAAuthorizationManagerMockup"    ).new();

            await contractAddressLocatorProxy.set("IETHConverter", ethConverter.address);
            await contractAddressLocatorProxy.set("IPaymentQueue"           , paymentQueue           .address);
            await contractAddressLocatorProxy.set("IPaymentManager"         , paymentManager         .address);
            await contractAddressLocatorProxy.set("IPaymentHandler"         , paymentManagerUser     .address);
            await contractAddressLocatorProxy.set("ISGATokenManager"     , paymentManagerUser     .address);
            await contractAddressLocatorProxy.set("ISGAAuthorizationManager", sgaAuthorizationManager.address);

            await sgaAuthorizationManager.setState(true);
        });

        it("should abort with an error if called by a non authorized user", async function() {
            await sgaAuthorizationManager.setState(false);
            await catchRevert(paymentManager.settlePayments(1));
        });

        it("should succeed if called by an authorized user", async function() {
            await sgaAuthorizationManager.setState(true);
            await paymentManager.settlePayments(1);
        });


        it("should succeed partial settle", async function() {
            paymentAmount = web3.toBigNumber(web3.toWei("10000"));
            ethBalanceAmount = web3.toBigNumber(web3.toWei("1000"));

            await web3.eth.sendTransaction({from: owner, to: paymentManagerUser.address, value: ethBalanceAmount});
            await paymentQueue.addPayment(owner, paymentAmount);
            await paymentManager.setMaxNumOfPaymentsLimit(10, {from: owner});
            const response = await paymentManager.settlePayments(1);

            assert.equal(response.logs[0].event, "PaymentPartialSettled");
            assert(response.logs[0].args._input.toNumber == paymentAmount.toNumber);
            assert(response.logs[0].args._output.toNumber ==  ethBalanceAmount.toNumber);
            assert.equal(paymentAmount - ethBalanceAmount, await paymentQueue.getLastPaymentUpdateAmount(), "invalid queue update amount");
        });

        var settlePaymentsValues = [
        {
            'name': "allIsEqual",
            'numberOfRequiredPayments': 4,
            'numberOfPaymentsToSettle': 4,
            'maxNumOfPaymentsLimit': 4,
            'expectedNumberOfRequiredPaymentsAfterSettlePayments': 0
        },
        {
            'name': "equal to maxNumOfPaymentsLimit",
            'numberOfRequiredPayments': 20,
            'numberOfPaymentsToSettle': 4,
            'maxNumOfPaymentsLimit': 4,
            'expectedNumberOfRequiredPaymentsAfterSettlePayments': 16
        },
        {
            'name': "equal to numberOfRequiredPayments",
            'numberOfRequiredPayments': 5,
            'numberOfPaymentsToSettle': 5,
            'maxNumOfPaymentsLimit': 10,
            'expectedNumberOfRequiredPaymentsAfterSettlePayments': 0
        },
        {
            'name': "cappedByMaxNumOfPaymentsLimit",
            'numberOfRequiredPayments': 20,
            'numberOfPaymentsToSettle': 5,
            'maxNumOfPaymentsLimit': 3,
            'expectedNumberOfRequiredPaymentsAfterSettlePayments': 17
        },
        {
            'name': "cappedByNumberOfPaymentsToSettle",
            'numberOfRequiredPayments': 20,
            'numberOfPaymentsToSettle': 5,
            'maxNumOfPaymentsLimit': 10,
            'expectedNumberOfRequiredPaymentsAfterSettlePayments': 15
        }
        ];

        for (let j = 0; j < settlePaymentsValues.length; j++) {
            it(`cap values combinations ${settlePaymentsValues[j].name}`, async function() {
              const numberOfRequiredPayments = settlePaymentsValues[j].numberOfRequiredPayments;
              const maxNumOfPaymentsLimit = settlePaymentsValues[j].maxNumOfPaymentsLimit;
              const numberOfPaymentsToSettle = settlePaymentsValues[j].numberOfPaymentsToSettle;
              const expectedNumberOfRequiredPaymentsAfterSettlePayments = settlePaymentsValues[j].expectedNumberOfRequiredPaymentsAfterSettlePayments;

              for (let i = 0; i < numberOfRequiredPayments; i++)
                await paymentQueue.addPayment(owner, 0);
                await paymentManager.setMaxNumOfPaymentsLimit(maxNumOfPaymentsLimit, {from: owner});

                await paymentManager.settlePayments(numberOfPaymentsToSettle);

                const actualNumberOfRequiredPaymentsAfterSettlePayments    = await paymentQueue.getNumOfPayments();
                assert(actualNumberOfRequiredPaymentsAfterSettlePayments  == expectedNumberOfRequiredPaymentsAfterSettlePayments, `expected = ${expectedNumberOfRequiredPaymentsAfterSettlePayments}; actual = ${actualNumberOfRequiredPaymentsAfterSettlePayments}`);
            });
        }

    });
});
