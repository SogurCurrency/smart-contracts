pragma solidity 0.4.25;

/**
 * @title Saga Exchanger Interface.
 */
interface ISagaExchanger {
    /**
     * @dev Transfer SGA to an SGN holder.
     * @param _to The address of the SGN holder.
     * @param _value The amount of SGA to transfer.
     */
    function transferSgaToSgnHolder(address _to, uint256 _value) external;
}
