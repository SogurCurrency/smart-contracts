pragma solidity 0.4.25;

import "./interfaces/IWalletsTradingLimiter.sol";
import "./interfaces/IWalletsTradingDataSource.sol";
import "./interfaces/IWalletsTradingLimiterValueConverter.sol";
import "./interfaces/ITradingClasses.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "../authorization/interfaces/IAuthorizationDataSource.sol";
import "openzeppelin-solidity-v1.12.0/contracts/ownership/Claimable.sol";

/**
 * @title Wallets Trading Limiter Base.
 */
contract WalletsTradingLimiterBase is IWalletsTradingLimiter, ContractAddressLocatorHolder, Claimable {
    string public constant VERSION = "1.0.0";

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
     * @dev Return the contract which implements the IAuthorizationDataSource interface.
     */
    function getAuthorizationDataSource() public view returns (IAuthorizationDataSource) {
        return IAuthorizationDataSource(getContractAddress(_IAuthorizationDataSource_));
    }

    /**
     * @dev Return the contract which implements the IWalletsTradingDataSource interface.
     */
    function getWalletsTradingDataSource() public view returns (IWalletsTradingDataSource) {
        return IWalletsTradingDataSource(getContractAddress(_IWalletsTradingDataSource_));
    }

    /**
     * @dev Return the contract which implements the IWalletsTradingLimiterValueConverter interface.
     */
    function getWalletsTradingLimiterValueConverter() public view returns (IWalletsTradingLimiterValueConverter) {
        return IWalletsTradingLimiterValueConverter(getContractAddress(_IWalletsTradingLimiterValueConverter_));
    }

    /**
     * @dev Return the contract which implements the ITradingClasses interface.
     */
    function getTradingClasses() public view returns (ITradingClasses) {
        return ITradingClasses(getContractAddress(_ITradingClasses_));
    }

    /**
     * @dev Get the limiter value.
     * @param _value The amount to be converted to the limiter value.
     * @return The limiter value worth of the given amount.
     */
    function getLimiterValue(uint256 _value) public view returns (uint256);

    /**
     * @dev Get the contract locator identifier that is permitted to perform update wallet.
     * @return The contract locator identifier.
     */
    function getUpdateWalletPermittedContractLocatorIdentifier() public pure returns (bytes32);

    /**
     * @dev Increment the limiter value of a wallet.
     * @param _wallet The address of the wallet.
     * @param _value The amount to be updated.
     */
    function updateWallet(address _wallet, uint256 _value) external only(getUpdateWalletPermittedContractLocatorIdentifier()) {
        uint256 limiterValue =  getLimiterValue(_value);
        (uint256 tradeLimit, uint256 tradeClass) = getAuthorizationDataSource().getTradeLimitAndClass(_wallet);
        uint256 actualLimit = tradeLimit > 0 ? tradeLimit : getTradingClasses().getLimit(tradeClass);
        getWalletsTradingDataSource().updateWallet(_wallet, limiterValue, actualLimit);
    }
}
