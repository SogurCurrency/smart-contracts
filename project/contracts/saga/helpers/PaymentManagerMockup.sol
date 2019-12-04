pragma solidity 0.4.25;

import "../interfaces/IPaymentManager.sol";

contract PaymentManagerMockup is IPaymentManager {
    bool private error;
    uint256 private numOfPayments;
    uint256 private paymentsSum;

    function setError(bool _error) external {
        error = _error;
    }

    function getNumOfPayments() external view returns (uint256) {
        return numOfPayments;
    }

    function getPaymentsSum() external view returns (uint256) {
        return paymentsSum;
    }

    function computeDifferPayment(uint256 _ethAmount, uint256 _ethBalance) external view returns (uint256) {
        if (error)
            return _ethAmount + 1;
        if (_ethAmount > _ethBalance)
            return _ethAmount - _ethBalance;
        else
            return 0;
    }

    function registerDifferPayment(address _wallet, uint256 _ethAmount) external {
        _wallet;
        _ethAmount;
    }

    function setNumOfPayments(uint256 _numOfPayments) external{
        numOfPayments = _numOfPayments;
    }

    function setPaymentsSum(uint256 _paymentsSum) external{
        paymentsSum = _paymentsSum;
    }
}
