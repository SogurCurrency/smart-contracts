pragma solidity 0.4.25;

import "../interfaces/IWalletsTradingDataSource.sol";

contract WalletsTradingDataSourceMockup is IWalletsTradingDataSource {
    function updateWallet(address _wallet, uint256 _value, uint256 _limit) external {
        _wallet;
        _value;
        _limit;
    }
}
