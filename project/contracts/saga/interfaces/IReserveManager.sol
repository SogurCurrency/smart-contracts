pragma solidity 0.4.25;

/**
 * @title Reserve Manager Interface.
 */
interface IReserveManager {
    /**
     * @dev Get a deposit-recommendation.
     * @param _balance The balance of the token-contract.
     * @return The address of the wallet permitted to deposit ETH into the token-contract.
     * @return The amount that should be deposited in order for the balance to reach `mid` ETH.
     */
    function getDepositParams(uint256 _balance) external view returns (address, uint256);

    /**
     * @dev Get a withdraw-recommendation.
     * @param _balance The balance of the token-contract.
     * @return The address of the wallet permitted to withdraw ETH into the token-contract.
     * @return The amount that should be withdrawn in order for the balance to reach `mid` ETH.
     */
    function getWithdrawParams(uint256 _balance) external view returns (address, uint256);
}
