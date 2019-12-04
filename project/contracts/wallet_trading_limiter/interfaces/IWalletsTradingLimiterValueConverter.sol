pragma solidity 0.4.25;

/**
 * @title Wallets Trading Limiter Value Converter Interface.
 */
interface IWalletsTradingLimiterValueConverter {
    /**
     * @dev Get the current limiter currency worth of a given SGA amount.
     * @param _sgaAmount The amount of SGA to convert.
     * @return The equivalent amount of the limiter currency.
     */
    function toLimiterValue(uint256 _sgaAmount) external view returns (uint256);
}
