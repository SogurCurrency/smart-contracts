pragma solidity 0.4.25;

import "./interfaces/IRedButton.sol";
import "./interfaces/IPaymentManager.sol";
import "./interfaces/IReserveManager.sol";
import "./interfaces/ISGRTokenManager.sol";
import "./interfaces/ITransactionManager.sol";
import "./interfaces/ISGRAuthorizationManager.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "../wallet_trading_limiter/interfaces/IWalletsTradingLimiter.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title SGR Token Manager.
 */
contract SGRTokenManager is ISGRTokenManager, ContractAddressLocatorHolder {
    string public constant VERSION = "2.0.0";

    using SafeMath for uint256;

    event ExchangeEthForSgrCompleted(address indexed _user, uint256 _input, uint256 _output);
    event ExchangeSgrForEthCompleted(address indexed _user, uint256 _input, uint256 _output);
    event MintSgrForSgnHoldersCompleted(uint256 _value);
    event TransferSgrToSgnHolderCompleted(address indexed _to, uint256 _value);
    event TransferEthToSgrHolderCompleted(address indexed _to, uint256 _value, bool _status);
    event DepositCompleted(address indexed _sender, uint256 _balance, uint256 _amount);
    event WithdrawCompleted(address indexed _sender, uint256 _balance, uint256 _amount);

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
     * @dev Return the contract which implements the ISGRAuthorizationManager interface.
     */
    function getSGRAuthorizationManager() public view returns (ISGRAuthorizationManager) {
        return ISGRAuthorizationManager(getContractAddress(_ISGRAuthorizationManager_));
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
        return IWalletsTradingLimiter(getContractAddress(_SellWalletsTradingLimiter_SGRTokenManager_));
    }

    /**
     * @dev Return the contract which implements the IWalletsTradingLimiter interface.
     */
    function getBuyWalletsTradingLimiter() public view returns (IWalletsTradingLimiter) {
        return IWalletsTradingLimiter(getContractAddress(_BuyWalletsTradingLimiter_SGRTokenManager_));
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
     * @dev Exchange ETH for SGR.
     * @param _sender The address of the sender.
     * @param _ethAmount The amount of ETH received.
     * @return The amount of SGR that the sender is entitled to.
     */
    function exchangeEthForSgr(address _sender, uint256 _ethAmount) external only(_ISGRToken_) onlyIfRedButtonIsNotEnabled returns (uint256) {
        require(getSGRAuthorizationManager().isAuthorizedToBuy(_sender), "exchanging ETH for SGR is not authorized");
        uint256 sgrAmount = getTransactionManager().buy(_ethAmount);
        emit ExchangeEthForSgrCompleted(_sender, _ethAmount, sgrAmount);
        getBuyWalletsTradingLimiter().updateWallet(_sender, sgrAmount);
        return sgrAmount;
    }

    /**
     * @dev Handle after the ETH for SGR exchange operation.
     * @param _sender The address of the sender.
     * @param _ethAmount The amount of ETH received.
     * @param _sgrAmount The amount of SGR given.
     */
    function afterExchangeEthForSgr(address _sender, uint256 _ethAmount, uint256 _sgrAmount) external {
        _sender;
        _ethAmount;
        _sgrAmount;
    }


    /**
     * @dev Exchange SGR for ETH.
     * @param _sender The address of the sender.
     * @param _sgrAmount The amount of SGR received.
     * @return The amount of ETH that the sender is entitled to.
     */
    function exchangeSgrForEth(address _sender, uint256 _sgrAmount) external only(_ISGRToken_) onlyIfRedButtonIsNotEnabled returns (uint256) {
        require(getSGRAuthorizationManager().isAuthorizedToSell(_sender), "exchanging SGR for ETH is not authorized");
        uint256 ethAmount = getTransactionManager().sell(_sgrAmount);
        emit ExchangeSgrForEthCompleted(_sender, _sgrAmount, ethAmount);
        getSellWalletsTradingLimiter().updateWallet(_sender, _sgrAmount);
        IPaymentManager paymentManager = getPaymentManager();
        uint256 paymentETHAmount = paymentManager.computeDifferPayment(ethAmount, msg.sender.balance);
        if (paymentETHAmount > 0)
            paymentManager.registerDifferPayment(_sender, paymentETHAmount);
        assert(ethAmount >= paymentETHAmount);
        return ethAmount - paymentETHAmount;
    }

    /**
    * @dev Handle after the SGR for ETH exchange operation.
    * @param _sender The address of the sender.
    * @param _sgrAmount The amount of SGR received.
    * @param _ethAmount The amount of ETH given.
    * @return The is success result.
    */
    function afterExchangeSgrForEth(address _sender, uint256 _sgrAmount, uint256 _ethAmount) external returns (bool) {
        _sender;
        _sgrAmount;
        _ethAmount;
        return true;
    }


    /**
     * @dev Handle direct SGR transfer.
     * @dev Any authorization not required.
     * @param _sender The address of the sender.
     * @param _to The address of the destination account.
     * @param _value The amount of SGR to be transferred.
     */
    function uponTransfer(address _sender, address _to, uint256 _value) external only(_ISGRToken_) {
        _sender;
        _to;
        _value;
    }

    /**
     * @dev Handle after direct SGR transfer operation.
     * @param _sender The address of the sender.
     * @param _to The address of the destination account.
     * @param _value The SGR transferred amount.
     * @param _transferResult The transfer result.
     * @return is success result.
     */
    function afterTransfer(address _sender, address _to, uint256 _value, bool _transferResult) external returns (bool) {
        _sender;
        _to;
        _value;
        return _transferResult;
    }

    /**
     * @dev Handle custodian SGR transfer.
     * @dev Any authorization not required.
     * @param _sender The address of the sender.
     * @param _from The address of the source account.
     * @param _to The address of the destination account.
     * @param _value The amount of SGR to be transferred.
     */
    function uponTransferFrom(address _sender, address _from, address _to, uint256 _value) external only(_ISGRToken_) {
        _sender;
        _from;
        _to;
        _value;
    }

    /**
     * @dev Handle after custodian SGR transfer operation.
     * @param _sender The address of the sender.
     * @param _from The address of the source account.
     * @param _to The address of the destination account.
     * @param _value The SGR transferred amount.
     * @param _transferFromResult The transferFrom result.
     * @return is success result.
     */
    function afterTransferFrom(address _sender, address _from, address _to, uint256 _value, bool _transferFromResult) external returns (bool) {
        _sender;
        _from;
        _to;
        _value;
        return _transferFromResult;
    }

    /**
     * @dev Handle the operation of ETH deposit into the SGRToken contract.
     * @param _sender The address of the account which has issued the operation.
     * @param _balance The amount of ETH in the SGRToken contract.
     * @param _amount The deposited ETH amount.
     * @return The address of the reserve-wallet and the deficient amount of ETH in the SGRToken contract.
     */
    function uponDeposit(address _sender, uint256 _balance, uint256 _amount) external only(_ISGRToken_) returns (address, uint256) {
        uint256 ethBalancePriorToDeposit = _balance.sub(_amount);
        (address wallet, uint256 recommendationAmount) = getReserveManager().getDepositParams(ethBalancePriorToDeposit);
        require(wallet == _sender, "caller is illegal");
        require(recommendationAmount > 0, "operation is not required");
        emit DepositCompleted(_sender, ethBalancePriorToDeposit, _amount);
        return (wallet, recommendationAmount);
    }

    /**
     * @dev Handle the operation of ETH withdrawal from the SGRToken contract.
     * @param _sender The address of the account which has issued the operation.
     * @param _balance The amount of ETH in the SGRToken contract prior the withdrawal.
     * @return The address of the reserve-wallet and the excessive amount of ETH in the SGRToken contract.
     */
    function uponWithdraw(address _sender, uint256 _balance) external only(_ISGRToken_) returns (address, uint256) {
        require(getSGRAuthorizationManager().isAuthorizedForPublicOperation(_sender), "withdraw is not authorized");
        (address wallet, uint256 amount) = getReserveManager().getWithdrawParams(_balance);
        require(wallet != address(0), "caller is illegal");
        require(amount > 0, "operation is not required");
        emit WithdrawCompleted(_sender, _balance, amount);
        return (wallet, amount);
    }

    /**
     * @dev Handle after ETH withdrawal from the SGRToken contract operation.
     * @param _sender The address of the account which has issued the operation.
     * @param _wallet The address of the withdrawal wallet.
     * @param _amount The ETH withdraw amount.
     * @param _priorWithdrawEthBalance The amount of ETH in the SGRToken contract prior the withdrawal.
     * @param _afterWithdrawEthBalance The amount of ETH in the SGRToken contract after the withdrawal.
     */
    function afterWithdraw(address _sender, address _wallet, uint256 _amount, uint256 _priorWithdrawEthBalance, uint256 _afterWithdrawEthBalance) external {
        _sender;
        _wallet;
        _amount;
        _priorWithdrawEthBalance;
        _afterWithdrawEthBalance;
    }
    /** 
     * @dev Upon SGR mint for SGN holders.
     * @param _value The amount of SGR to mint.
     */
    function uponMintSgrForSgnHolders(uint256 _value) external only(_ISGRToken_) {
        emit MintSgrForSgnHoldersCompleted(_value);
    }

    /**
     * @dev Handle after SGR mint for SGN holders.
     * @param _value The minted amount of SGR.
     */
    function afterMintSgrForSgnHolders(uint256 _value) external {
        _value;
    }

    /**
     * @dev Upon SGR transfer to an SGN holder.
     * @param _to The address of the SGN holder.
     * @param _value The amount of SGR to transfer.
     */
    function uponTransferSgrToSgnHolder(address _to, uint256 _value) external only(_ISGRToken_) onlyIfRedButtonIsNotEnabled {
        emit TransferSgrToSgnHolderCompleted(_to, _value);
    }

    /**
     * @dev Handle after SGR transfer to an SGN holder.
     * @param _to The address of the SGN holder.
     * @param _value The transferred amount of SGR.
     */
    function afterTransferSgrToSgnHolder(address _to, uint256 _value) external {
        _to;
        _value;
    }

    /**
     * @dev Upon ETH transfer to an SGR holder.
     * @param _to The address of the SGR holder.
     * @param _value The amount of ETH to transfer.
     * @param _status The operation's completion-status.
     */
    function postTransferEthToSgrHolder(address _to, uint256 _value, bool _status) external only(_ISGRToken_) {
        emit TransferEthToSgrHolderCompleted(_to, _value, _status);
    }

    /**
     * @dev Get the address of the reserve-wallet and the deficient amount of ETH in the SGRToken contract.
     * @return The address of the reserve-wallet and the deficient amount of ETH in the SGRToken contract.
     */
    function getDepositParams() external view only(_ISGRToken_) returns (address, uint256) {
        return getReserveManager().getDepositParams(msg.sender.balance);
    }

    /**
     * @dev Get the address of the reserve-wallet and the excessive amount of ETH in the SGRToken contract.
     * @return The address of the reserve-wallet and the excessive amount of ETH in the SGRToken contract.
     */
    function getWithdrawParams() external view only(_ISGRToken_) returns (address, uint256) {
        return getReserveManager().getWithdrawParams(msg.sender.balance);
    }
}
