pragma solidity 0.4.25;

import "../interfaces/IPaymentHandler.sol";
import "../interfaces/IPaymentManager.sol";

contract PaymentManagerUser is IPaymentHandler {
    IPaymentManager private paymentManager;

    constructor(IPaymentManager _paymentManager) public {
        paymentManager = _paymentManager;
    }

    function() external payable {
    }

    function getEthBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function transferEthToSgrHolder(address _to, uint256 _value) external {
        _to.transfer(_value);
    }

    function sell(address _wallet, uint256 _ethAmount) external {
        uint256 ethAmountInPayment = paymentManager.computeDifferPayment(_ethAmount, address(this).balance);
        if (ethAmountInPayment > 0)
            paymentManager.registerDifferPayment(_wallet, ethAmountInPayment);
        if (_ethAmount > ethAmountInPayment)
            _wallet.transfer(_ethAmount - ethAmountInPayment);
    }
}
