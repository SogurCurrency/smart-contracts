pragma solidity 0.4.25;

/**
 * @title Minting Point Timers Manager Interface.
 */
interface IMintingPointTimersManager {
    /**
     * @dev Start a given timestamp.
     * @param _id The ID of the timestamp.
     * @notice When tested, this timestamp will be either 'running' or 'expired'.
     */
    function start(uint256 _id) external;

    /**
     * @dev Reset a given timestamp.
     * @param _id The ID of the timestamp.
     * @notice When tested, this timestamp will be neither 'running' nor 'expired'.
     */
    function reset(uint256 _id) external;

    /**
     * @dev Get an indication of whether or not a given timestamp is 'running'.
     * @param _id The ID of the timestamp.
     * @return An indication of whether or not a given timestamp is 'running'.
     * @notice Even if this timestamp is not 'running', it is not necessarily 'expired'.
     */
    function running(uint256 _id) external view returns (bool);

    /**
     * @dev Get an indication of whether or not a given timestamp is 'expired'.
     * @param _id The ID of the timestamp.
     * @return An indication of whether or not a given timestamp is 'expired'.
     * @notice Even if this timestamp is not 'expired', it is not necessarily 'running'.
     */
    function expired(uint256 _id) external view returns (bool);
}
