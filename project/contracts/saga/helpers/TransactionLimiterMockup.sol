pragma solidity 0.4.25;

import "../interfaces/ITransactionLimiter.sol";

contract TransactionLimiterMockup is ITransactionLimiter {
    function resetTotal() external {}

    function incTotalBuy(uint256 _amount) external {
        _amount;
    }

    function incTotalSell(uint256 _amount) external {
        _amount;
    }
}
