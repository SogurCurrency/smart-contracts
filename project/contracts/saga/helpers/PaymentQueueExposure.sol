pragma solidity 0.4.25;

import "../PaymentQueue.sol";

contract PaymentQueueExposure is PaymentQueue {

    constructor(IContractAddressLocator _contractAddressLocator) PaymentQueue(_contractAddressLocator) public {}

    function getPaymentQueueLength() external view returns (uint256) {
        return payments.length;
    }

    function getPaymentQueueIndex(address _address) external view returns (uint256) {
        for(uint256 i = 0; i < payments.length; i++){
            if (payments[i].wallet == _address)
              return i;
        }
        assert(false);
        return 0;
    }

    function getFromPaymentsArray(uint256 _index) external view returns (address, uint256) {
        return (payments[_index].wallet, payments[_index].amount);
    }
}
