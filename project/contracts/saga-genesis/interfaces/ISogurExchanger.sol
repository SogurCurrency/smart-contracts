pragma solidity 0.4.25;

/**
 * @title Sogur Exchanger Interface.
 */
interface ISogurExchanger {
    /**
     * @dev Transfer SGR to an SGN holder.
     * @param _to The address of the SGN holder.
     * @param _value The amount of SGR to transfer.
     */
    function transferSgrToSgnHolder(address _to, uint256 _value) external;
}
