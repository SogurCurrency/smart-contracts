pragma solidity 0.4.25;

import "../interfaces/IPaymentQueue.sol";


contract PaymentQueueMockup is IPaymentQueue {
    struct Payment {
        address wallet;
        uint256 amount;
    }

    Payment[] private payments;
    uint256 private first;
    uint256 private last;
    uint256 private maxCleanLength;

    bool private useMockedNumOfPayments;
    uint256 private numOfPayments;

    uint256 private paymentsSum;

    uint256 private lastPaymentUpdateAmount;


    function getNumOfPayments() external view returns (uint256) {
        if (useMockedNumOfPayments)
          return numOfPayments;
        else
          return last - first;
    }

    function getPaymentsSum() external view returns (uint256) {
        return paymentsSum;
    }

    function getPayment(uint256 _index) external view returns (address, uint256) {
        Payment storage payment = payments[first + _index];
        return (payment.wallet, payment.amount);
    }

    function addPayment(address _wallet, uint256 _amount) external {
        last++;
        payments.push(Payment({wallet: _wallet, amount: _amount}));
    }

    function updatePayment(uint256 _amount) external {
        lastPaymentUpdateAmount = _amount;
        assert(_amount > 0);
        payments[first].amount = _amount;
    }

    function removePayment() external {
        first++;
    }

    function setNumOfPayments(uint256 _numOfPayments, bool _useMockedNumOfPayments) external{
        numOfPayments =  _numOfPayments;
        useMockedNumOfPayments = _useMockedNumOfPayments;
    }

    function setPaymentsSum(uint256 _paymentsSum) external{
        paymentsSum = _paymentsSum;
    }

    function getLastPaymentUpdateAmount() external view returns (uint256) {
        return lastPaymentUpdateAmount;
    }

}

