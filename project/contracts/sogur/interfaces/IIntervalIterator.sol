pragma solidity 0.4.25;

/**
 * @title Interval Iterator Interface.
 */
interface IIntervalIterator {
    /**
     * @dev Move to a higher interval and start a corresponding timer if necessary.
     */
    function grow() external;

    /**
     * @dev Reset the timer of the current interval if necessary and move to a lower interval.
     */
    function shrink() external;

    /**
     * @dev Return the current interval.
     */
    function getCurrentInterval() external view returns (uint256, uint256, uint256, uint256, uint256, uint256);

    /**
     * @dev Return the current interval coefficients.
     */
    function getCurrentIntervalCoefs() external view returns (uint256, uint256);
}
