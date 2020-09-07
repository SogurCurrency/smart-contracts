pragma solidity 0.4.25;

/**
 * @title Wallets Trading Limiter Value Converter Interface.
 */
interface IWalletsTradingLimiterValueConverter {
    /**
     * @dev Get the current limiter currency worth of a given SGR amount.
     * @param _sgrAmount The amount of SGR to convert.
     * @return The equivalent amount of the limiter currency.
     */
    function toLimiterValue(uint256 _sgrAmount) external view returns (uint256);
}
