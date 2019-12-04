pragma solidity 0.4.25;

/**
 * @title Model Calculator Interface.
 */
interface IModelCalculator {
    /**
     * @dev Check whether or not an interval is trivial.
     * @param _alpha The alpha-value of the interval.
     * @param _beta The beta-value of the interval.
     * @return True if and only if the interval is trivial.
     */
    function isTrivialInterval(uint256 _alpha, uint256 _beta) external pure returns (bool);

    /**
     * @dev Calculate N(R) on a trivial interval.
     * @param _valR The given value of R on the interval.
     * @param _maxN The maximum value of N on the interval.
     * @param _maxR The maximum value of R on the interval.
     * @return N(R).
     */
    function getValN(uint256 _valR, uint256 _maxN, uint256 _maxR) external pure returns (uint256);

    /**
     * @dev Calculate R(N) on a trivial interval.
     * @param _valN The given value of N on the interval.
     * @param _maxR The maximum value of R on the interval.
     * @param _maxN The maximum value of N on the interval.
     * @return R(N).
     */
    function getValR(uint256 _valN, uint256 _maxR, uint256 _maxN) external pure returns (uint256);

    /**
     * @dev Calculate N(R) on a non-trivial interval.
     * @param _newR The given value of R on the interval.
     * @param _minR The minimum value of R on the interval.
     * @param _minN The minimum value of N on the interval.
     * @param _alpha The alpha-value of the interval.
     * @param _beta The beta-value of the interval.
     * @return N(R).
     */
    function getNewN(uint256 _newR, uint256 _minR, uint256 _minN, uint256 _alpha, uint256 _beta) external pure returns (uint256);

    /**
     * @dev Calculate R(N) on a non-trivial interval.
     * @param _newN The given value of N on the interval.
     * @param _minN The minimum value of N on the interval.
     * @param _minR The minimum value of R on the interval.
     * @param _alpha The alpha-value of the interval.
     * @param _beta The beta-value of the interval.
     * @return R(N).
     */
    function getNewR(uint256 _newN, uint256 _minN, uint256 _minR, uint256 _alpha, uint256 _beta) external pure returns (uint256);
}
