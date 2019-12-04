pragma solidity 0.4.25;

/**
 * @title Mint Handler Interface.
 */
interface IMintHandler {
    /**
     * @dev Upon minting of SGN vested in delay.
     * @param _index The minting-point index.
     */
    function mintSgnVestedInDelay(uint256 _index) external;
}
