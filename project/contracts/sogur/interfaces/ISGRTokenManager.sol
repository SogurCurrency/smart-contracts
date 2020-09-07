pragma solidity 0.4.25;
/**
 * @title SGR Token Manager Interface.
 */
interface ISGRTokenManager {
    /**
     * @dev Exchange ETH for SGR.
     * @param _sender The address of the sender.
     * @param _ethAmount The amount of ETH received.
     * @return The amount of SGR that the sender is entitled to.
     */
    function exchangeEthForSgr(address _sender, uint256 _ethAmount) external returns (uint256);

    /**
     * @dev Handle after the ETH for SGR exchange operation.
     * @param _sender The address of the sender.
     * @param _ethAmount The amount of ETH received.
     * @param _sgrAmount The amount of SGR given.
     */
    function afterExchangeEthForSgr(address _sender, uint256 _ethAmount, uint256 _sgrAmount) external;

    /**
     * @dev Exchange SGR for ETH.
     * @param _sender The address of the sender.
     * @param _sgrAmount The amount of SGR received.
     * @return The amount of ETH that the sender is entitled to.
     */
    function exchangeSgrForEth(address _sender, uint256 _sgrAmount) external returns (uint256);

    /**
     * @dev Handle after the SGR for ETH exchange operation.
     * @param _sender The address of the sender.
     * @param _sgrAmount The amount of SGR received.
     * @param _ethAmount The amount of ETH given.
     * @return The is success result.
     */
    function afterExchangeSgrForEth(address _sender, uint256 _sgrAmount, uint256 _ethAmount) external returns (bool);

    /**
     * @dev Handle direct SGR transfer.
     * @param _sender The address of the sender.
     * @param _to The address of the destination account.
     * @param _value The amount of SGR to be transferred.
     */
    function uponTransfer(address _sender, address _to, uint256 _value) external;


    /**
     * @dev Handle after direct SGR transfer operation.
     * @param _sender The address of the sender.
     * @param _to The address of the destination account.
     * @param _value The SGR transferred amount.
     * @param _transferResult The transfer result.
     * @return is success result.
     */
    function afterTransfer(address _sender, address _to, uint256 _value, bool _transferResult) external returns (bool);

    /**
     * @dev Handle custodian SGR transfer.
     * @param _sender The address of the sender.
     * @param _from The address of the source account.
     * @param _to The address of the destination account.
     * @param _value The amount of SGR to be transferred.
     */
    function uponTransferFrom(address _sender, address _from, address _to, uint256 _value) external;

    /**
     * @dev Handle after custodian SGR transfer operation.
     * @param _sender The address of the sender.
     * @param _from The address of the source account.
     * @param _to The address of the destination account.
     * @param _value The SGR transferred amount.
     * @param _transferFromResult The transferFrom result.
     * @return is success result.
     */
    function afterTransferFrom(address _sender, address _from, address _to, uint256 _value, bool _transferFromResult) external returns (bool);

    /**
     * @dev Handle the operation of ETH deposit into the SGRToken contract.
     * @param _sender The address of the account which has issued the operation.
     * @param _balance The amount of ETH in the SGRToken contract.
     * @param _amount The deposited ETH amount.
     * @return The address of the reserve-wallet and the deficient amount of ETH in the SGRToken contract.
     */
    function uponDeposit(address _sender, uint256 _balance, uint256 _amount) external returns (address, uint256);

    /**
     * @dev Handle the operation of ETH withdrawal from the SGRToken contract.
     * @param _sender The address of the account which has issued the operation.
     * @param _balance The amount of ETH in the SGRToken contract prior the withdrawal.
     * @return The address of the reserve-wallet and the excessive amount of ETH in the SGRToken contract.
     */
    function uponWithdraw(address _sender, uint256 _balance) external returns (address, uint256);

    /**
     * @dev Handle after ETH withdrawal from the SGRToken contract operation.
     * @param _sender The address of the account which has issued the operation.
     * @param _wallet The address of the withdrawal wallet.
     * @param _amount The ETH withdraw amount.
     * @param _priorWithdrawEthBalance The amount of ETH in the SGRToken contract prior the withdrawal.
     * @param _afterWithdrawEthBalance The amount of ETH in the SGRToken contract after the withdrawal.
     */
    function afterWithdraw(address _sender, address _wallet, uint256 _amount, uint256 _priorWithdrawEthBalance, uint256 _afterWithdrawEthBalance) external;

    /** 
     * @dev Upon SGR mint for SGN holders.
     * @param _value The amount of SGR to mint.
     */
    function uponMintSgrForSgnHolders(uint256 _value) external;

    /**
     * @dev Handle after SGR mint for SGN holders.
     * @param _value The minted amount of SGR.
     */
    function afterMintSgrForSgnHolders(uint256 _value) external;

    /**
     * @dev Upon SGR transfer to an SGN holder.
     * @param _to The address of the SGN holder.
     * @param _value The amount of SGR to transfer.
     */
    function uponTransferSgrToSgnHolder(address _to, uint256 _value) external;

    /**
     * @dev Handle after SGR transfer to an SGN holder.
     * @param _to The address of the SGN holder.
     * @param _value The transferred amount of SGR.
     */
    function afterTransferSgrToSgnHolder(address _to, uint256 _value) external;

    /**
     * @dev Upon ETH transfer to an SGR holder.
     * @param _to The address of the SGR holder.
     * @param _value The amount of ETH to transfer.
     * @param _status The operation's completion-status.
     */
    function postTransferEthToSgrHolder(address _to, uint256 _value, bool _status) external;

    /**
     * @dev Get the address of the reserve-wallet and the deficient amount of ETH in the SGRToken contract.
     * @return The address of the reserve-wallet and the deficient amount of ETH in the SGRToken contract.
     */
    function getDepositParams() external view returns (address, uint256);

    /**
     * @dev Get the address of the reserve-wallet and the excessive amount of ETH in the SGRToken contract.
     * @return The address of the reserve-wallet and the excessive amount of ETH in the SGRToken contract.
     */
    function getWithdrawParams() external view returns (address, uint256);
}
