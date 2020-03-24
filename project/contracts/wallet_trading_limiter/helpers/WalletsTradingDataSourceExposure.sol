pragma solidity 0.4.25;

import "../WalletsTradingDataSource.sol";

contract WalletsTradingDataSourceExposure is WalletsTradingDataSource {
    constructor(IContractAddressLocator _contractAddressLocator) WalletsTradingDataSource(_contractAddressLocator) public {}

    function modifierOnlyAuthorizedExecutors() external view onlyAuthorizedExecutors {
    }
}
