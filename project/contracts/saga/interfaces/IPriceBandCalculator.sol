pragma solidity 0.4.25;

/**
 * @title Price Band Calculator Interface.
 */
interface IPriceBandCalculator {
    /**
     * @dev Deduct price-band from a given amount of SDR.
     * @param _sdrAmount The amount of SDR.
     * @param _sgaTotal The total amount of SGA.
     * @param _alpha The alpha-value of the current interval.
     * @param _beta The beta-value of the current interval.
     * @return The amount of SDR minus the price-band.
     */
    function buy(uint256 _sdrAmount, uint256 _sgaTotal, uint256 _alpha, uint256 _beta) external pure returns (uint256);

    /**
     * @dev Deduct price-band from a given amount of SDR.
     * @param _sdrAmount The amount of SDR.
     * @param _sgaTotal The total amount of SGA.
     * @param _alpha The alpha-value of the current interval.
     * @param _beta The beta-value of the current interval.
     * @return The amount of SDR minus the price-band.
     */
    function sell(uint256 _sdrAmount, uint256 _sgaTotal, uint256 _alpha, uint256 _beta) external pure returns (uint256);
}
