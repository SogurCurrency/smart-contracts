pragma solidity 0.4.25;

import "./SGRWalletsTradingLimiter.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title SGR Buy Wallets Trading Limiter.
 */
contract SGRBuyWalletsTradingLimiter is SGRWalletsTradingLimiter {
    string public constant VERSION = "2.0.0";

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) SGRWalletsTradingLimiter(_contractAddressLocator, _BuyWalletsTradingDataSource_) public {}

    /**
     * @dev Get the wallet override trade-limit and class.
     * @return The wallet override trade-limit and class.
     */
    function getOverrideTradeLimitAndClass(address _wallet) public view returns (uint256, uint256){
        return getAuthorizationDataSource().getBuyTradeLimitAndClass(_wallet);

    }

    /**
     * @dev Get the wallet trade-limit.
     * @return The wallet trade-limit.
     */
    function getTradeLimit(uint256 _tradeClassId) public view returns (uint256){
        return getTradingClasses().getBuyLimit(_tradeClassId);
    }
}


