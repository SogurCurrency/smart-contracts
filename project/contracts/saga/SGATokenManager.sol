pragma solidity 0.4.25;

import "./interfaces/IRedButton.sol";
import "./interfaces/IPaymentManager.sol";
import "./interfaces/IReserveManager.sol";
import "./interfaces/ISGATokenManager.sol";
import "./interfaces/ITransactionManager.sol";
import "./interfaces/ISGAAuthorizationManager.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "../wallet_trading_limiter/interfaces/IWalletsTradingLimiter.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title SGA Token Manager.
 */
contract SGATokenManager is ISGATokenManager, ContractAddressLocatorHolder {
    string public constant VERSION = "1.1.0";

    using SafeMath for uint256;

    event ExchangeEthForSgaCompleted(address indexed _user, uint256 _input, uint256 _output);
    event ExchangeSgaForEthCompleted(address indexed _user, uint256 _input, uint256 _output);
    event MintSgaForSgnHoldersCompleted(uint256 _value);
    event TransferSgaToSgnHolderCompleted(address indexed _to, uint256 _value);
    event TransferEthToSgaHolderCompleted(address indexed _to, uint256 _value, bool _status);
    event DepositCompleted(address indexed _sender, uint256 _balance, uint256 _amount);
    event WithdrawCompleted(address indexed _sender, uint256 _balance, uint256 _amount);

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
     * @dev Return the contract which implements the ISGAAuthorizationManager interface.
     */
    function getSGAAuthorizationManager() public view returns (ISGAAuthorizationManager) {
        return ISGAAuthorizationManager(getContractAddress(_ISGAAuthorizationManager_));
    }

    /**
     * @dev Return the contract which implements the ITransactionManager interface.
     */
    function getTransactionManager() public view returns (ITransactionManager) {
        return ITransactionManager(getContractAddress(_ITransactionManager_));
    }

    /**
     * @dev Return the contract which implements the IWalletsTradingLimiter interface.
     */
    function getSellWalletsTradingLimiter() public view returns (IWalletsTradingLimiter) {
        return IWalletsTradingLimiter(getContractAddress(_SellWalletsTradingLimiter_SGATokenManager_));
    }

    /**
     * @dev Return the contract which implements the IWalletsTradingLimiter interface.
     */
    function getBuyWalletsTradingLimiter() public view returns (IWalletsTradingLimiter) {
        return IWalletsTradingLimiter(getContractAddress(_BuyWalletsTradingLimiter_SGATokenManager_));
    }

    /**
     * @dev Return the contract which implements the IReserveManager interface.
     */
    function getReserveManager() public view returns (IReserveManager) {
        return IReserveManager(getContractAddress(_IReserveManager_));
    }

    /**
     * @dev Return the contract which implements the IPaymentManager interface.
     */
    function getPaymentManager() public view returns (IPaymentManager) {
        return IPaymentManager(getContractAddress(_IPaymentManager_));
    }

    /**
     * @dev Return the contract which implements the IRedButton interface.
     */
    function getRedButton() public view returns (IRedButton) {
        return IRedButton(getContractAddress(_IRedButton_));
    }

    /**
     * @dev Reverts if called when the red button is enabled.
     */
    modifier onlyIfRedButtonIsNotEnabled() {
        require(!getRedButton().isEnabled(), "red button is enabled");
        _;
    }

    /**
     * @dev Exchange ETH for SGA.
     * @param _sender The address of the sender.
     * @param _ethAmount The amount of ETH received.
     * @return The amount of SGA that the sender is entitled to.
     */
    function exchangeEthForSga(address _sender, uint256 _ethAmount) external only(_ISGAToken_) onlyIfRedButtonIsNotEnabled returns (uint256) {
        require(getSGAAuthorizationManager().isAuthorizedToBuy(_sender), "exchanging ETH for SGA is not authorized");
        uint256 sgaAmount = getTransactionManager().buy(_ethAmount);
        emit ExchangeEthForSgaCompleted(_sender, _ethAmount, sgaAmount);
        getBuyWalletsTradingLimiter().updateWallet(_sender, sgaAmount);
        return sgaAmount;
    }

    /**
     * @dev Exchange SGA for ETH.
     * @param _sender The address of the sender.
     * @param _sgaAmount The amount of SGA received.
     * @return The amount of ETH that the sender is entitled to.
     */
    function exchangeSgaForEth(address _sender, uint256 _sgaAmount) external only(_ISGAToken_) onlyIfRedButtonIsNotEnabled returns (uint256) {
        require(getSGAAuthorizationManager().isAuthorizedToSell(_sender), "exchanging SGA for ETH is not authorized");
        uint256 ethAmount = getTransactionManager().sell(_sgaAmount);
        emit ExchangeSgaForEthCompleted(_sender, _sgaAmount, ethAmount);
        getSellWalletsTradingLimiter().updateWallet(_sender, _sgaAmount);
        IPaymentManager paymentManager = getPaymentManager();
        uint256 paymentETHAmount = paymentManager.computeDifferPayment(ethAmount, msg.sender.balance);
        if (paymentETHAmount > 0)
            paymentManager.registerDifferPayment(_sender, paymentETHAmount);
        assert(ethAmount >= paymentETHAmount);
        return ethAmount - paymentETHAmount;
    }

    /**
     * @dev Handle direct SGA transfer.
     * @dev Any authorization not required.
     * @param _sender The address of the sender.
     * @param _to The address of the destination account.
     * @param _value The amount of SGA to be transferred.
     */
    function uponTransfer(address _sender, address _to, uint256 _value) external only(_ISGAToken_) {
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
    function uponTransferFrom(address _sender, address _from, address _to, uint256 _value) external only(_ISGAToken_) {
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
    function uponDeposit(address _sender, uint256 _balance, uint256 _amount) external only(_ISGAToken_) returns (address, uint256) {
        uint256 ethBalancePriorToDeposit = _balance.sub(_amount);
        (address wallet, uint256 recommendationAmount) = getReserveManager().getDepositParams(ethBalancePriorToDeposit);
        require(wallet == _sender, "caller is illegal");
        require(recommendationAmount > 0, "operation is not required");
        emit DepositCompleted(_sender, ethBalancePriorToDeposit, _amount);
        return (wallet, recommendationAmount);
    }

    /**
     * @dev Handle the operation of ETH withdrawal from the SGAToken contract.
     * @param _sender The address of the account which has issued the operation.
     * @param _balance The amount of ETH in the SGAToken contract prior the withdrawal.
     * @return The address of the reserve-wallet and the excessive amount of ETH in the SGAToken contract.
     */
    function uponWithdraw(address _sender, uint256 _balance) external only(_ISGAToken_) returns (address, uint256) {
        require(getSGAAuthorizationManager().isAuthorizedForPublicOperation(_sender), "withdraw is not authorized");
        (address wallet, uint256 amount) = getReserveManager().getWithdrawParams(_balance);
        require(wallet != address(0), "caller is illegal");
        require(amount > 0, "operation is not required");
        emit WithdrawCompleted(_sender, _balance, amount);
        return (wallet, amount);
    }

    /** 
     * @dev Upon SGA mint for SGN holders.
     * @param _value The amount of SGA to mint.
     */
    function uponMintSgaForSgnHolders(uint256 _value) external only(_ISGAToken_) {
        emit MintSgaForSgnHoldersCompleted(_value);
    }

    /**
     * @dev Upon SGA transfer to an SGN holder.
     * @param _to The address of the SGN holder.
     * @param _value The amount of SGA to transfer.
     */
    function uponTransferSgaToSgnHolder(address _to, uint256 _value) external only(_ISGAToken_) onlyIfRedButtonIsNotEnabled {
        emit TransferSgaToSgnHolderCompleted(_to, _value);
    }

    /**
     * @dev Upon ETH transfer to an SGA holder.
     * @param _to The address of the SGA holder.
     * @param _value The amount of ETH to transfer.
     * @param _status The operation's completion-status.
     */
    function postTransferEthToSgaHolder(address _to, uint256 _value, bool _status) external only(_ISGAToken_) {
        emit TransferEthToSgaHolderCompleted(_to, _value, _status);
    }

    /**
     * @dev Get the address of the reserve-wallet and the deficient amount of ETH in the SGAToken contract.
     * @return The address of the reserve-wallet and the deficient amount of ETH in the SGAToken contract.
     */
    function getDepositParams() external view only(_ISGAToken_) returns (address, uint256) {
        return getReserveManager().getDepositParams(msg.sender.balance);
    }

    /**
     * @dev Get the address of the reserve-wallet and the excessive amount of ETH in the SGAToken contract.
     * @return The address of the reserve-wallet and the excessive amount of ETH in the SGAToken contract.
     */
    function getWithdrawParams() external view only(_ISGAToken_) returns (address, uint256) {
        return getReserveManager().getWithdrawParams(msg.sender.balance);
    }
}
