pragma solidity 0.4.25;

/**
 * @title Mint Listener Interface.
 */
interface IMintListener {
    /**
     * @dev Mint SGA for SGN holders.
     * @param _value The amount of SGA to mint.
     */
    function mintSgaForSgnHolders(uint256 _value) external;
}
