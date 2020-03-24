pragma solidity 0.4.25;

import "./SGAWalletsTradingLimiter.sol";


/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title SGA sell Wallets Trading Limiter.
 */
contract SGASellWalletsTradingLimiter is SGAWalletsTradingLimiter {
    string public constant VERSION = "1.1.0";

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) SGAWalletsTradingLimiter(_contractAddressLocator, _SellWalletsTradingDataSource_) public {}


    /**
     * @dev Get the wallet override trade-limit and class.
     * @return The wallet override trade-limit and class.
     */
    function getOverrideTradeLimitAndClass(address _wallet) public view returns (uint256, uint256){
        return getAuthorizationDataSource().getSellTradeLimitAndClass(_wallet);

    }

    /**
     * @dev Get the wallet trade-limit.
     * @return The wallet trade-limit.
     */
    function getTradeLimit(uint256 _tradeClassId) public view returns (uint256){
        return getTradingClasses().getSellLimit(_tradeClassId);
    }
}


