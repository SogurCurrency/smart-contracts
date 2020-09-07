pragma solidity 0.4.25;

/**
 * @title Mint Listener Interface.
 */
interface IMintListener {
    /**
     * @dev Mint SGR for SGN holders.
     * @param _value The amount of SGR to mint.
     */
    function mintSgrForSgnHolders(uint256 _value) external;
}
