pragma solidity 0.4.25;

/**
 * @title Saga Exchanger Interface.
 * @dev Old exchanger adapting by SagaExchangerSogurAdapter to the new ISogurExchanger.
 */
interface ISagaExchanger {
    /**
     * @param _to The address of the SGN holder.
     * @param _value The amount of SGR to transfer.
     */
    function transferSgaToSgnHolder(address _to, uint256 _value) external;
}