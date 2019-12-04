contract("PaymentQueueUnitTest", function(accounts) {
    let contractAddressLocatorProxy;
    let paymentQueue;

    const notPermittedExecutor  = accounts[1];

    let   uniqueAddressCounterIndex = 100;
    const testWallets = require("../utilities.js").createAddresses(1, 20);
    const repeatingPayments = createRepeatingPayments(require("../utilities.js").createAddresses(30, 20));
    const repeatingPaymentsLength = repeatingPayments.length;

    let VALID_AMOUNT = 20;

    const nullAddress        = require("../utilities.js").address(0);
    const catchRevert        = require("../exceptions.js").catchRevert;
    const catchInvalidOpcode = require("../exceptions.js").catchInvalidOpcode;

    beforeEach(async function() {
      contractAddressLocatorProxy = await artifacts.require("ContractAddressLocatorProxyMockup").new();
      paymentQueue                   = await artifacts.require("PaymentQueueExposure").new(contractAddressLocatorProxy.address);

      await contractAddressLocatorProxy.set("IPaymentManager", accounts[0]);
      uniqueAddressCounterIndex = 100;
    });

    describe("function getNumOfPayments:", function() {
      it("should be init to 0", async function() {
        await assertPropsEqual({"payment_num" :  0});
      });

      it("should increase while adding payments", async function() {
        for (let i = 0; i < 10; i++) {
          await addPayment();
          await assertPropsEqual({"payment_num" :  i+1});
        }
      });

      it("should increase while adding payments with repeated payments", async function() {
        await  addPayment(testWallets[0]);
        await  assertPropsEqual({"payment_num" :  1});
        await  addPayment(testWallets[0]);
        await  assertPropsEqual({"payment_num" :  2});
        await  addPayment(testWallets[1]);
        await  assertPropsEqual({"payment_num" :  3});
        await  addPayment(testWallets[0]);
        await  assertPropsEqual({"payment_num" :  4});
      });

      it("should decrease while removing payments", async function() {
        await addPayments(10);
        for (let i = 0; i < 10; i++) {
          await assertPropsEqual({"payment_num" :  10 - i });
          await removePayment();
        }
        await assertPropsEqual({"payment_num" : 0 });
      });

      it("should decrease while removing payments with repeated payments", async function() {
        await addRepeatingPayments();
        for (let j = 0; j < repeatingPaymentsLength; j++) {
          await assertPropsEqual({"payment_num" :  repeatingPaymentsLength - j });
          await removePayment();
        }
        await assertPropsEqual({"payment_num" : 0 });
      });

      it("should reset to zero and increase if reset first and last to zero", async function() {
        await addPayments(10);
        await removePayments(10);
        await assertPropsEqual({"payment_num" : 0 });
        await addPayments(2);
        await assertPropsEqual({"payment_num" :2 });
        await addPayments(20);
        await assertPropsEqual({"payment_num" :22 });
      });
    });

    describe("function getPaymentsSum:", function() {
      it("should be init to 0", async function() {
        await assertPropsEqual({"payment_sum" :  0});
      });

      it("should increase while adding payments", async function() {
        let expectedSum = 0;
        for (let i = 1; i < 10; i++) {
          expectedSum = expectedSum + (i*1000);
          await addPayment(testWallets[i], i*1000);
          await assertPropsEqual({"payment_sum" :  expectedSum });
        }
      });

      it("should increase while adding payments with repeated payments", async function() {
        await  addPayment(testWallets[0], 1500);
        await  assertPropsEqual({"payment_sum" :  1500});
        await  addPayment(testWallets[0], 200);
        await  assertPropsEqual({"payment_sum" :  1700});
        await  addPayment(testWallets[1], 300);
        await  assertPropsEqual({"payment_sum" :  2000});
        await  addPayment(testWallets[0], 100);
        await  assertPropsEqual({"payment_sum" :  2100});
      });

      it("should decrease while removing payments", async function() {
        let initSum = 200 * 10;
        await addPayments(10, 200);

        for (let i = 0; i < 10; i++) {
          await assertPropsEqual({"payment_sum" :  initSum - (i*200) });
          await removePayment();
        }
        await assertPropsEqual({"payment_sum" : 0 });
      });

      it("should be consist with update payment", async function() {
        await addPayment(testWallets[0], 100);
        await addPayment(testWallets[1], 100);
        await paymentQueue.updatePayment(50);
        await assertPropsEqual({"payment_sum" :  150 });
        await paymentQueue.updatePayment(200);
        await assertPropsEqual({"payment_sum" :  300 });
      });

      it("should reset to zero and increase if reset first and last to zero", async function() {
        await addPayments(10);
        await removePayments(10);
        await assertPropsEqual({"payment_sum" : 0 });
        await addPayments(2, 700);
        await assertPropsEqual({"payment_sum" :1400 });
        await addPayments(20, 20);
        await assertPropsEqual({"payment_sum" :1800 });
      });
    });

    describe("function getPayment:", function() {
      it("should abort with an error if queue is empty", async function() {
        await catchInvalidOpcode(paymentQueue.getPayment(0));
        await addPayment();
        await removePayment();
        await catchInvalidOpcode(paymentQueue.getPayment(0));
      });

      it("should abort with an error if requesting out of range index", async function() {
        await addPayments(10);
        await paymentQueue.getPayment(9);
        await catchRevert(paymentQueue.getPayment(10));
        await addPayment();
        await paymentQueue.getPayment(10);
        await removePayment();
        await catchRevert(paymentQueue.getPayment(10));
      });

      it("should abort with an error if requesting out of range index with first and last reset", async function() {
        await addPayment();
        await removePayment();
        await addPayment();
        await paymentQueue.getPayment(0);
        await catchRevert(paymentQueue.getPayment(1));
        await addPayment();
        await paymentQueue.getPayment(1);
      });

      it("should get the payments while adding", async function() {
        for (let i = 0; i < 10; i++){
          await addPayment(testWallets[i]);
          await assertGetPayment({"index" :  i, "payment" :  testWallets[i]});
        }
        for (let i = 0; i < 10; i++){
          await assertGetPayment({"index" :  i, "payment" :  testWallets[i]});
        }
      });

      it("should get the payments while adding with repeated payments", async function() {
        await addPayment(testWallets[0], 50);
        await assertGetPayment({"index" :  0, "payment" :  testWallets[0], "payment_amount" : 50});
        await addPayment(testWallets[0], 100);
        await assertGetPayment({"index" :  1, "payment" :  testWallets[0], "payment_amount" : 100});
        await addPayment(testWallets[1], 50);
        await assertGetPayment({"index" :  2, "payment" :  testWallets[1], "payment_amount" : 50});
        await addPayment(testWallets[0], 20);
        await assertGetPayment({"index" :  3, "payment" :  testWallets[0], "payment_amount" : 20});

        await assertGetPayment({"index" :  0, "payment" :  testWallets[0], "payment_amount" : 50});
        await assertGetPayment({"index" :  1, "payment" :  testWallets[0], "payment_amount" : 100});
        await assertGetPayment({"index" :  2, "payment" :  testWallets[1], "payment_amount" : 50});
        await assertGetPayment({"index" :  3, "payment" :  testWallets[0], "payment_amount" : 20});
      });

      it("should get the payments while adding after reset first and last to zero", async function() {
        await addPayments(2);
        await removePayments(2);

        await addPayment(testWallets[0]);
        await addPayment(testWallets[1]);
        await addPayment(testWallets[2]);

        await assertGetPayment({"index" :  0, "payment" :  testWallets[0]});
        await assertGetPayment({"index" :  1, "payment" :  testWallets[1]});
        await assertGetPayment({"index" :  2, "payment" :  testWallets[2]});
      });

      it("should get payment from the next index after remove", async function() {
        for (let i = 0; i < 10; i++){
          await addPayment(testWallets[i]);
        }
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10-i; j++) {
            await assertGetPayment({"index" :  j, "payment" :  testWallets[j+i]});
          }
          await removePayment();
        }
      });

    });

    describe("function addPayment:", function() {
      it("should abort with an error if called by not permitted executor", async function() {
        await catchRevert(paymentQueue.addPayment(testWallets[0], VALID_AMOUNT, {from: notPermittedExecutor}));
      });

      it("should abort with an error if input wallet is invalid", async function() {
        await catchInvalidOpcode(paymentQueue.addPayment(nullAddress, VALID_AMOUNT));
      });

      it("should abort with an error if input amount is invalid", async function() {
        await catchInvalidOpcode(paymentQueue.addPayment(testWallets[0], 0));
      });

      it("should increment last while adding", async function() {
        await assertPropsEqual({"first" : 0, "last" :  0});
        for (let i = 0; i < 10; i++) {
          await addPayment(testWallets[i]);

          await assertPropsEqual({"first" : 0, "last" :  i+1, "queue_length" :  i+1});
          await assertIndexInQueue(testWallets[i], i);
        }
      });

      it("should increment last while adding with repeated payments", async function() {
        await addPayment(testWallets[0]);
        await assertPropsEqual({"first" : 0, "last" :  1, "queue_length" :  1});
        await addPayment(testWallets[0]);
        await assertPropsEqual({"first" : 0, "last" :  2, "queue_length" :  2});
        await addPayment(testWallets[1]);
        await assertPropsEqual({"first" : 0, "last" :  3, "queue_length" :  3});
        await addPayment(testWallets[0]);
        await assertPropsEqual({"first" : 0, "last" :  4, "queue_length" :  4});
      });

      it("should increment last after reset first and last to zero", async function() {
        await addPayments(10);
        await removePayments(10);
        await assertPropsEqual({"first" : 0, "last" :  0, "queue_length" :  10});

        await addPayments(7);
        await assertPropsEqual({"first" : 0, "last" :  7, "queue_length" :  10});
      });

      it("should not occupy queue places before reset first and last to zero", async function() {
        await addPayment(testWallets[0]);
        await addPayment(testWallets[1]);
        await removePayment();
        await addPayment(testWallets[2]);

        await assertIndexInQueue(nullAddress, 0);
        await assertIndexInQueue(testWallets[1], 1);
        await assertIndexInQueue(testWallets[2], 2);
      });
      it("should occupy not in use queue places after reset first and last", async function() {
        await addPayments(2);
        await removePayments(2);

        await addPayment(testWallets[0]);
        await addPayment(testWallets[1]);
        await addPayment(testWallets[2]);

        await assertIndexInQueue(testWallets[0], 0);
        await assertIndexInQueue(testWallets[1], 1);
        await assertIndexInQueue(testWallets[2], 2);
      });

    });

    describe("function updatePayment:", function() {
      let validUpdateAmount = 50;

      it("should abort with an error if called by not permitted executor", async function() {
        await catchRevert(paymentQueue.updatePayment(validUpdateAmount, {from: notPermittedExecutor}));
      });

      it("should abort with an error if queue is empty", async function() {
        await catchInvalidOpcode(paymentQueue.updatePayment(validUpdateAmount));
        await addPayment();
        await removePayment();
        await catchInvalidOpcode(paymentQueue.updatePayment(validUpdateAmount));
      });

      it("should abort with an error after reset to 0", async function() {
        await addPayments(2);
        await removePayments(2);
        await catchInvalidOpcode(paymentQueue.updatePayment(validUpdateAmount));
      });

      it("should abort with an error if input amount is invalid", async function() {
        await addPayment();
        await catchInvalidOpcode(paymentQueue.updatePayment(0));
      });

      it("should always update the first payment", async function() {
        await addPayment(testWallets[0]);
        await addPayments(10);
        for (let i = 0; i < 5; i++) {
          await paymentQueue.updatePayment(50 + i);
          await assertGetPayment({"index" :  0, "payment" :  testWallets[0], "payment_amount" : 50 + i});
          await assertPropsEqual({"first" : 0});
        }
      });

      it("should always update the first payment while removing", async function() {
        await addPayment(testWallets[0], 20);
        await addPayment(testWallets[0], 20);
        await addPayment(testWallets[1], 20);
        await addPayment(testWallets[2], 20);

        await paymentQueue.updatePayment(52);
        await assertGetPayment({"index" :  0, "payment" :  testWallets[0], "payment_amount" : 52});
        await assertPropsEqual({"first" : 0});

        await removePayment();
        await paymentQueue.updatePayment(53);
        await assertGetPayment({"index" :  0, "payment" :  testWallets[0], "payment_amount" : 53});
        await assertPropsEqual({"first" : 1});

        await removePayment();
        await paymentQueue.updatePayment(54);
        await assertGetPayment({"index" :  0, "payment" :  testWallets[1], "payment_amount" : 54});
        await assertPropsEqual({"first" : 2});

        await removePayment();
        await paymentQueue.updatePayment(55);
        await assertGetPayment({"index" :  0, "payment" :  testWallets[2], "payment_amount" : 55});
        await assertPropsEqual({"first" : 3});
      });

      it("should always update the first payment while removing after reset to 0", async function() {
        await addPayments(5);
        await removePayments(5);

        await addPayment(testWallets[0]);
        await addPayment(testWallets[1]);

        await removePayment();

        await paymentQueue.updatePayment(54);
        await assertGetPayment({"index" :  0, "payment" :  testWallets[1], "payment_amount" : 54});
        await assertPropsEqual({"first" : 1});
      });
    });

    describe("function removePayment:", function() {
      it("should abort with an error if called by not permitted executor", async function() {
        await addPayment();
        await catchRevert(paymentQueue.removePayment({from: notPermittedExecutor}));
      });

      it("should abort with an error if queue is empty", async function() {
        await catchInvalidOpcode(paymentQueue.removePayment());
      });

      it("should abort with an error if removing all payments", async function() {
        await addPayments(3);
        await removePayments(3);
        await catchInvalidOpcode(removePayment());
      });

      it("should never increment first more then length", async function() {
        await addPayments(3);
        await assertPropsEqual({"first" : 0, "queue_length" : 3})
        await removePayment();
        await assertPropsEqual({"first" : 1, "queue_length" : 3})
        await removePayment();
        await assertPropsEqual({"first" : 2, "queue_length" : 3})
        await removePayment();
        await assertPropsEqual({"first" : 0, "queue_length" : 3});
      });

      it("should increment first while not reached last", async function() {
        await addRepeatingPayments();

        await assertPropsEqual({"first" : 0, "last" : repeatingPaymentsLength, "queue_length" :  repeatingPaymentsLength});

        for (let i = 0; i < repeatingPaymentsLength; i++) {
          await assertPropsEqual({"first" : i, "last" : repeatingPaymentsLength, "queue_length" :  repeatingPaymentsLength});
          await removePayment();
        }
      });

      it("should reset first and last to zero if first is reaching last", async function() {
        await addPayments(5);
        await assertPropsEqual({"last" :  5, "first" : 0, "queue_length" :  5});

        for (let i = 0; i < 4; i++) {
          await removePayment();
          await assertPropsEqual({"last" :  5, "first" : i+1});
        }
        await assertPropsEqual({"last" :  5, "first" : 4, "queue_length" :  5});
        await removePayment();
        await assertPropsEqual({"last" :  0, "first" : 0, "queue_length" :  5});
      });

      it("should always remove the next payment", async function() {
        await addPayment(testWallets[0]);
        await addPayment(testWallets[0], 190);
        await addPayment(testWallets[1]);
        await addPayment(testWallets[2]);
        await addPayment(testWallets[3]);

        await assertGetPayment({"index" :  0, "payment" :  testWallets[0]});
        await removePayment();

        await assertGetPayment({"index" :  0, "payment" :  testWallets[0], "payment_amount" :  190});
        await removePayment();

        await assertGetPayment({"index" :  0, "payment" :  testWallets[1]});
        await removePayment();

        await assertGetPayment({"index" :  0, "payment" :  testWallets[2]});
        await removePayment();

        await assertGetPayment({"index" :  0, "payment" :  testWallets[3]});
      });

      it("should set to zero the removed payment", async function() {
        await addPayment(testWallets[0], 170);
        await addPayment(testWallets[0], 190);
        await addPayment(testWallets[1], 200);

        await assertGetPayment({"index" :  0, "payment" :  testWallets[0], "payment_amount" :  170}, false);
        await assertGetPayment({"index" :  1, "payment" :  testWallets[0], "payment_amount" :  190}, false);
        await assertGetPayment({"index" :  2, "payment" :  testWallets[1], "payment_amount" :  200}, false);

        await removePayments(3);
        await assertGetPayment({"index" :  0, "payment" :  nullAddress, "payment_amount" :  0}, false);
        await assertGetPayment({"index" :  1, "payment" :  nullAddress, "payment_amount" :  0}, false);
        await assertGetPayment({"index" :  2, "payment" :  nullAddress, "payment_amount" :  0}, false);

        await addPayment(testWallets[5], 50);
        await assertGetPayment({"index" :  0, "payment" :  testWallets[5], "payment_amount" :  50}, false);
        await removePayment();
        await assertGetPayment({"index" :  0, "payment" :  nullAddress, "payment_amount" :  0}, false);
      });

    });

    describe("function clean:", function() {

        let sgaAuthorizationManager;

        beforeEach(async function() {
          sgaAuthorizationManager        = await artifacts.require("SGAAuthorizationManagerMockup"    ).new();
          await contractAddressLocatorProxy.set("ISGAAuthorizationManager", sgaAuthorizationManager.address);
          await sgaAuthorizationManager.setState(true);
        });

        it("should abort with an error if called by a non authorized user", async function() {
          await sgaAuthorizationManager.setState(false);
          await catchRevert(paymentQueue.clean(100));
        });

        it("should not clean if queue length is equal to last", async function() {
          await addPayments(2);
          await assertPropsEqual({"queue_length" :  2, "last" :  2});
          await paymentQueue.clean(100);
          await assertPropsEqual({"queue_length" :  2, "last" :  2});
        });

        it("should clean only after last", async function() {
          await addPayments(5);
          await removePayments(5);
          await addPayment(testWallets[0]);
          await addPayment(testWallets[1]);

          await assertPropsEqual({"last" :  2, "queue_length" :  5});
          await paymentQueue.clean(100);
          await assertPropsEqual({"last" :  2, "queue_length" :  2});
          await assertIndexInQueue(testWallets[0], 0);
          await assertIndexInQueue(testWallets[1], 1);

          await addPayment(testWallets[2]);
          await addPayment(testWallets[3]);
          await addPayment(testWallets[4]);
          await addPayment(testWallets[5]);

          await assertPropsEqual({"last" :  6, "queue_length" :  6});
          await paymentQueue.clean(100);
          await assertPropsEqual({"queue_length" :  6});
          await assertIndexInQueue(testWallets[0], 0);
          await assertIndexInQueue(testWallets[1], 1);
          await assertIndexInQueue(testWallets[2], 2);
          await assertIndexInQueue(testWallets[3], 3);
          await assertIndexInQueue(testWallets[4], 4);
        });

        it("should clean all if queue length is lower from maxCleanLength", async function() {
          await addPayments(5);
          await removePayments(5);
          await assertPropsEqual({"queue_length" :  5});
          await paymentQueue.clean(100);
          await assertPropsEqual({"queue_length" :  0});
        });

        it("should clean maxCleanLength if queue length is greater from maxCleanLength", async function() {
          await addPayments(5);
          await removePayments(5);
          await paymentQueue.clean(2);
          await assertPropsEqual({"queue_length" :  3});

          await paymentQueue.clean(2);
          await assertPropsEqual({"queue_length" :  1});

          await paymentQueue.clean(2);
          await assertPropsEqual({"queue_length" :  0});
        });

    });


     async function addPayment(address, amount) {
         if (typeof address === 'undefined')
           address = createUniqueAddress();

         if (typeof amount === 'undefined')
           amount = VALID_AMOUNT;

        await paymentQueue.addPayment(address, amount);
     }

     async function addPayments(count, amount = VALID_AMOUNT) {
       for (let i = 0; i < count; i++) {
          const newUniqueAddress = createUniqueAddress();
          await paymentQueue.addPayment(newUniqueAddress, amount);
       }
     }

     async function removePayment() {
       await paymentQueue.removePayment();
     }
     async function removePayments(count) {
        for (let i = 0; i < count; i++) {
          await paymentQueue.removePayment();
        }
     }

     async function addRepeatingPayments() {
         for (let i = 0; i < repeatingPayments.length; i++) {
           await paymentQueue.addPayment(repeatingPayments[i], VALID_AMOUNT);
         }
     }


     async function assertPropsEqual(expectedAsserts) {
        for (x in expectedAsserts) {
          if (x != "last" && x != "first" && x != "payment_num" && x != "payment_sum" && x != "queue_length")
           assert(false, "unsupported expected assert " + x);
        }

        if (typeof expectedAsserts.first !== 'undefined'){
          assert.equal(await paymentQueue.first.call() , expectedAsserts.first );
        }

        if (typeof expectedAsserts.last !== 'undefined'){
          assert.equal(await paymentQueue.last.call() , expectedAsserts.last );
        }

        if (typeof expectedAsserts.queue_length !== 'undefined'){
          assert.equal(await paymentQueue.getPaymentQueueLength(),  expectedAsserts.queue_length);
        }

        if (typeof expectedAsserts.payment_num !== 'undefined'){
          assert.equal(await paymentQueue.getNumOfPayments(),  expectedAsserts.payment_num);
        }

        if (typeof expectedAsserts.payment_sum !== 'undefined'){
          assert.equal(await paymentQueue.getPaymentsSum(),  expectedAsserts.payment_sum);
        }
     }

     async function assertGetPayment(args, throughGetPayment = true) {
        if (typeof args.index === 'undefined'){
           assert(false, "missing index" );
        }
        if (typeof args.payment === 'undefined'){
           assert(false, "missing payment" );
        }
        for (x in args) {
          if (x != "index" && x != "payment" && x != "payment_amount")
            assert(false, "unsupported required assert " + x);
        }

        let actualPaymentWallet = 0;
        let actualPaymentAmount = 0;
        if (throughGetPayment)
          [actualPaymentWallet, actualPaymentAmount] = await paymentQueue.getPayment(args.index);
        else
          [actualPaymentWallet, actualPaymentAmount] = await paymentQueue.getFromPaymentsArray(args.index);

        assert.equal(actualPaymentWallet, args.payment );
        if (typeof args.payment_amount !== 'undefined'){
          assert.equal(actualPaymentAmount, args.payment_amount );
        }
     }

     async function assertIndexInQueue(payment, expectedIndex) {
        let indexInQueue = await paymentQueue.getPaymentQueueIndex(payment);


        assert.equal(expectedIndex, indexInQueue);
     }


     function createUniqueAddress() {
        const newUniqueAddress = require("../utilities.js").address(uniqueAddressCounterIndex);
        uniqueAddressCounterIndex++;
        return newUniqueAddress;
     }

     function createRepeatingPayments(uniqueAddresses) {
        uniqueAddresses.push(uniqueAddresses[0]);
        uniqueAddresses.push(uniqueAddresses[0]);

        let repeatingUniqAddress = createUniqueAddress();
        uniqueAddresses.push(repeatingUniqAddress);
        uniqueAddresses.push(repeatingUniqAddress);

        return uniqueAddresses;
     }

});
