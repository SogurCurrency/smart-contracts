pragma solidity 0.4.25;

import "../interfaces/IWalletsTradingDataSource.sol";

contract WalletsTradingDataSourceMockup is IWalletsTradingDataSource {
    uint256 calledWithValue;
    uint256 calledWithLimit;

    function updateWallet(address _wallet, uint256 _value, uint256 _limit) external {
        calledWithValue = _value;
        calledWithLimit = _limit;
        _wallet;
    }

    function getCalledValues() external view returns (uint256, uint256) {
        return (calledWithValue, calledWithLimit);
    }
}
