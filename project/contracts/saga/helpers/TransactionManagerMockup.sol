pragma solidity 0.4.25;

import "../interfaces/ITransactionManager.sol";

contract TransactionManagerMockup is ITransactionManager {
    function buy(uint256 _ethAmount) external returns (uint256) {
        return _ethAmount;
    }

    function sell(uint256 _sgaAmount) external returns (uint256) {
        return _sgaAmount;
    }
}
