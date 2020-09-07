pragma solidity 0.4.25;

/**
 * @title Reconciliation Adjuster Interface.
 */
interface IReconciliationAdjuster {
    /**
     * @dev Get the buy-adjusted value of a given SDR amount.
     * @param _sdrAmount The amount of SDR to adjust.
     * @return The adjusted amount of SDR.
     */
    function adjustBuy(uint256 _sdrAmount) external view returns (uint256);

    /**
     * @dev Get the sell-adjusted value of a given SDR amount.
     * @param _sdrAmount The amount of SDR to adjust.
     * @return The adjusted amount of SDR.
     */
    function adjustSell(uint256 _sdrAmount) external view returns (uint256);
}
