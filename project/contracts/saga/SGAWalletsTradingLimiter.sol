pragma solidity 0.4.25;

import "../wallet_trading_limiter/WalletsTradingLimiterBase.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title SGA Wallets Trading Limiter.
 */
contract SGAWalletsTradingLimiter is WalletsTradingLimiterBase {
    string public constant VERSION = "1.0.0";

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) WalletsTradingLimiterBase(_contractAddressLocator) public {}


    /**
     * @dev Get the contract locator identifier that is permitted to perform update wallet.
     * @return The contract locator identifier.
     */
    function getUpdateWalletPermittedContractLocatorIdentifier() public pure returns (bytes32){
        return _ISGATokenManager_;
    }

    /**
     * @dev Get the limiter value.
     * @param _value The SGA amount to convert to limiter value.
     * @return The limiter value worth of the given SGA amount.
     */
    function getLimiterValue(uint256 _value) public view returns (uint256){
        return getWalletsTradingLimiterValueConverter().toLimiterValue(_value);
    }
}




