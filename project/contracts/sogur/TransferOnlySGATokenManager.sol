pragma solidity 0.4.25;

import "./interfaces/ISGATokenManager.sol";
import "./interfaces/IReserveManager.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Transfer Only SGA Token Manager.
 */
contract TransferOnlySGATokenManager is ISGATokenManager, ContractAddressLocatorHolder {
    string public constant VERSION = "1.0.0";
    using SafeMath for uint256;

    event WithdrawCompleted(address indexed _sender, uint256 _balance, uint256 _amount);

    /**
    * @dev Create the contract.
    * @param _contractAddressLocator The contract address locator.
    */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    
      /**
     * @dev Return the contract which implements the IReserveManager interface.
     */
    function getReserveManager() public view returns (IReserveManager) {
        return IReserveManager(getContractAddress(_IReserveManager_));
    }
    
    /**
     * @dev Exchange ETH for SGA.
     * @param _sender The address of the sender.
     * @param _ethAmount The amount of ETH received.
     * @return The amount of SGA that the sender is entitled to.
     */
    function exchangeEthForSga(address _sender, uint256 _ethAmount) external returns (uint256) {
        require(false, "SGA token has been deprecated. Use SGR token instead");
        _sender;
        _ethAmount;
        return 0;
    }

    /**
     * @dev Exchange SGA for ETH.
     * @param _sender The address of the sender.
     * @param _sgaAmount The amount of SGA received.
     * @return The amount of ETH that the sender is entitled to.
     */
    function exchangeSgaForEth(address _sender, uint256 _sgaAmount) external returns (uint256) {
        require(false, "SGA token has been deprecated. Use SGR token instead");
        _sender;
        _sgaAmount;
        return 0;
    }

    /**
     * @dev Handle direct SGA transfer.
     * @dev Any authorization not required.
     * @param _sender The address of the sender.
     * @param _to The address of the destination account.
     * @param _value The amount of SGA to be transferred.
     */
    function uponTransfer(address _sender, address _to, uint256 _value) external {
        _sender;
        _to;
        _value;
    }

    /**
     * @dev Handle custodian SGA transfer.
     * @dev Any authorization not required.
     * @param _sender The address of the sender.
     * @param _from The address of the source account.
     * @param _to The address of the destination account.
     * @param _value The amount of SGA to be transferred.
     */
    function uponTransferFrom(address _sender, address _from, address _to, uint256 _value) external {
        _sender;
        _from;
        _to;
        _value;
    }

    /**
     * @dev Handle the operation of ETH deposit into the SGAToken contract.
     * @param _sender The address of the account which has issued the operation.
     * @param _balance The amount of ETH in the SGAToken contract.
     * @param _amount The deposited ETH amount.
     * @return The address of the reserve-wallet and the deficient amount of ETH in the SGAToken contract.
     */
    function uponDeposit(address _sender, uint256 _balance, uint256 _amount) external returns (address, uint256) {
        require(false, "SGA token has been deprecated. Use SGR token instead");
        _sender;
        _balance;
        _amount;
        return (address(0), 0);

    }

    /**
     * @dev Handle the operation of ETH withdrawal from the SGAToken contract.
     * @param _sender The address of the account which has issued the operation.
     * @param _balance The amount of ETH in the SGAToken contract prior the withdrawal.
     * @return The address of the reserve-wallet and the excessive amount of ETH in the SGAToken contract.
     */
    function uponWithdraw(address _sender, uint256 _balance) external returns (address, uint256) {
        (address wallet, uint256 amount) = getReserveManager().getWithdrawParams(_balance);
        require(wallet != address(0), "caller is illegal");
        emit WithdrawCompleted(_sender, _balance, amount);
        return (wallet, _balance);
    }

    /**
     * @dev Upon SGA mint for SGN holders.
     * @param _value The amount of SGA to mint.
     */
    function uponMintSgaForSgnHolders(uint256 _value) external {
        require(false, "SGA token has been deprecated. Use SGR token instead");
        _value;
    }

    /**
     * @dev Upon SGA transfer to an SGN holder.
     * @param _to The address of the SGN holder.
     * @param _value The amount of SGA to transfer.
     */
    function uponTransferSgaToSgnHolder(address _to, uint256 _value) external {
        require(false, "SGA token has been deprecated. Use SGR token instead");
        _to;
        _value;
    }

    /**
     * @dev Upon ETH transfer to an SGA holder.
     * @param _to The address of the SGA holder.
     * @param _value The amount of ETH to transfer.
     * @param _status The operation's completion-status.
     */
    function postTransferEthToSgaHolder(address _to, uint256 _value, bool _status) external {
        require(false, "SGA token has been deprecated. Use SGR token instead");
        _to;
        _value;
        _status;
    }

    /**
     * @dev Get the address of the reserve-wallet and the deficient amount of ETH in the SGAToken contract.
     * @return The address of the reserve-wallet and the deficient amount of ETH in the SGAToken contract.
     */
    function getDepositParams() external view returns (address, uint256) {
        require(false, "SGA token has been deprecated. Use SGR token instead");
        return (address(0), 0);
    }

    /**
     * @dev Get the address of the reserve-wallet and the excessive amount of ETH in the SGAToken contract.
     * @return The address of the reserve-wallet and the excessive amount of ETH in the SGAToken contract.
     */
    function getWithdrawParams() external view returns (address, uint256) {
        require(false, "SGA token has been deprecated. Use SGR token instead");
        return (address(0), 0);
    }
}
