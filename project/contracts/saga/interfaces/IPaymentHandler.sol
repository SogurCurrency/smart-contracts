pragma solidity 0.4.25;

/**
 * @title Payment Handler Interface.
 */
interface IPaymentHandler {
    /**
     * @dev Get the amount of available ETH.
     * @return The amount of available ETH.
     */
    function getEthBalance() external view returns (uint256);

    /**
     * @dev Transfer ETH to an SGA holder.
     * @param _to The address of the SGA holder.
     * @param _value The amount of ETH to transfer.
     */
    function transferEthToSgaHolder(address _to, uint256 _value) external;
}
