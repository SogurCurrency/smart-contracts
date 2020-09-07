pragma solidity 0.4.25;

/**
 * @title Mint Manager Interface.
 */
interface IMintManager {
    /**
     * @dev Return the current minting-point index.
     */
    function getIndex() external view returns (uint256);
}
