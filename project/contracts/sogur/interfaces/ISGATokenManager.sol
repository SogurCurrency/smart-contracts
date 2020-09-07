
pragma solidity 0.4.25;

/**
 * @title SGA Token Manager Interface.
 */
interface ISGATokenManager {
    /**
     * @dev Exchange ETH for SGA.
     * @param _sender The address of the sender.
     * @param _ethAmount The amount of ETH received.
     * @return The amount of SGA that the sender is entitled to.
     */
    function exchangeEthForSga(address _sender, uint256 _ethAmount) external returns (uint256);

    /**
     * @dev Exchange SGA for ETH.
     * @param _sender The address of the sender.
     * @param _sgaAmount The amount of SGA received.
     * @return The amount of ETH that the sender is entitled to.
     */
    function exchangeSgaForEth(address _sender, uint256 _sgaAmount) external returns (uint256);

    /**
     * @dev Handle direct SGA transfer.
     * @param _sender The address of the sender.
     * @param _to The address of the destination account.
     * @param _value The amount of SGA to be transferred.
     */
    function uponTransfer(address _sender, address _to, uint256 _value) external;

    /**
     * @dev Handle custodian SGA transfer.
     * @param _sender The address of the sender.
     * @param _from The address of the source account.
     * @param _to The address of the destination account.
     * @param _value The amount of SGA to be transferred.
     */
    function uponTransferFrom(address _sender, address _from, address _to, uint256 _value) external;

    /**
     * @dev Handle the operation of ETH deposit into the SGAToken contract.
     * @param _sender The address of the account which has issued the operation.
     * @param _balance The amount of ETH in the SGAToken contract.
     * @param _amount The deposited ETH amount.
     * @return The address of the reserve-wallet and the deficient amount of ETH in the SGAToken contract.
     */
    function uponDeposit(address _sender, uint256 _balance, uint256 _amount) external returns (address, uint256);

    /**
     * @dev Handle the operation of ETH withdrawal from the SGAToken contract.
     * @param _sender The address of the account which has issued the operation.
     * @param _balance The amount of ETH in the SGAToken contract prior the withdrawal.
     * @return The address of the reserve-wallet and the excessive amount of ETH in the SGAToken contract.
     */
    function uponWithdraw(address _sender, uint256 _balance) external returns (address, uint256);

    /**
     * @dev Upon SGA mint for SGN holders.
     * @param _value The amount of SGA to mint.
     */
    function uponMintSgaForSgnHolders(uint256 _value) external;

    /**
     * @dev Upon SGA transfer to an SGN holder.
     * @param _to The address of the SGN holder.
     * @param _value The amount of SGA to transfer.
     */
    function uponTransferSgaToSgnHolder(address _to, uint256 _value) external;

    /**
     * @dev Upon ETH transfer to an SGA holder.
     * @param _to The address of the SGA holder.
     * @param _value The amount of ETH to transfer.
     * @param _status The operation's completion-status.
     */
    function postTransferEthToSgaHolder(address _to, uint256 _value, bool _status) external;

    /**
     * @dev Get the address of the reserve-wallet and the deficient amount of ETH in the SGAToken contract.
     * @return The address of the reserve-wallet and the deficient amount of ETH in the SGAToken contract.
     */
    function getDepositParams() external view returns (address, uint256);

    /**
     * @dev Get the address of the reserve-wallet and the excessive amount of ETH in the SGAToken contract.
     * @return The address of the reserve-wallet and the excessive amount of ETH in the SGAToken contract.
     */
    function getWithdrawParams() external view returns (address, uint256);
}
