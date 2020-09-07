pragma solidity 0.4.25;

import "./interfaces/IWalletsTradingLimiter.sol";
import "./interfaces/IWalletsTradingDataSource.sol";
import "./interfaces/IWalletsTradingLimiterValueConverter.sol";
import "./interfaces/ITradingClasses.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "../authorization/interfaces/IAuthorizationDataSource.sol";
import "openzeppelin-solidity-v1.12.0/contracts/ownership/Claimable.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title Wallets Trading Limiter Base.
 */
contract WalletsTradingLimiterBase is IWalletsTradingLimiter, ContractAddressLocatorHolder, Claimable {
    string public constant VERSION = "1.1.0";

    bytes32 public walletsTradingDataSourceIdentifier;

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator, bytes32 _walletsTradingDataSourceIdentifier) ContractAddressLocatorHolder(_contractAddressLocator) public {
        walletsTradingDataSourceIdentifier = _walletsTradingDataSourceIdentifier;
    }

    /**
     * @dev Return the contract which implements the IAuthorizationDataSource interface.
     */
    function getAuthorizationDataSource() public view returns (IAuthorizationDataSource) {
        return IAuthorizationDataSource(getContractAddress(_IAuthorizationDataSource_));
    }

    /**
     * @dev Return the contract which implements the ITradingClasses interface.
     */
    function getTradingClasses() public view returns (ITradingClasses) {
        return ITradingClasses(getContractAddress(_ITradingClasses_));
    }

    /**
     * @dev Return the contract which implements the IWalletsTradingDataSource interface.
     */
    function getWalletsTradingDataSource() public view returns (IWalletsTradingDataSource) {
        return IWalletsTradingDataSource(getContractAddress(walletsTradingDataSourceIdentifier));
    }

    /**
     * @dev Return the contract which implements the IWalletsTradingLimiterValueConverter interface.
     */
    function getWalletsTradingLimiterValueConverter() public view returns (IWalletsTradingLimiterValueConverter) {
        return IWalletsTradingLimiterValueConverter(getContractAddress(_IWalletsTradingLimiterValueConverter_));
    }

    /**
     * @dev Get the contract locator identifier that is permitted to perform update wallet.
     * @return The contract locator identifier.
     */
    function getUpdateWalletPermittedContractLocatorIdentifier() public pure returns (bytes32);

    /**
     * @dev Get the wallet override trade-limit and class.
     * @return The wallet override trade-limit and class.
     */
    function getOverrideTradeLimitAndClass(address _wallet) public view returns (uint256, uint256);

    /**
     * @dev Get the wallet trade-limit.
     * @return The wallet trade-limit.
     */
    function getTradeLimit(uint256 _tradeClassId) public view returns (uint256);

    /**
     * @dev Get the limiter value.
     * @param _value The amount to be converted to the limiter value.
     * @return The limiter value worth of the given amount.
     */
    function getLimiterValue(uint256 _value) public view returns (uint256);


    /**
     * @dev Increment the limiter value of a wallet.
     * @param _wallet The address of the wallet.
     * @param _value The amount to be updated.
     */
    function updateWallet(address _wallet, uint256 _value) external only(getUpdateWalletPermittedContractLocatorIdentifier()) {
        uint256 limiterValue = getLimiterValue(_value);

        (uint256 overrideTradeLimit, uint256 tradeClassId) = getOverrideTradeLimitAndClass(_wallet);

        uint256 tradeLimit = overrideTradeLimit > 0 ? overrideTradeLimit : getTradeLimit(tradeClassId);

        getWalletsTradingDataSource().updateWallet(_wallet, limiterValue, tradeLimit);
    }
}
