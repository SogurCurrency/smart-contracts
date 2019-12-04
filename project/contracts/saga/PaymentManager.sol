pragma solidity 0.4.25;

import "./interfaces/IPaymentQueue.sol";
import "./interfaces/IPaymentManager.sol";
import "./interfaces/IPaymentHandler.sol";
import "./interfaces/IETHConverter.sol";
import "./interfaces/ISGAAuthorizationManager.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "openzeppelin-solidity-v1.12.0/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/math/Math.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Payment Manager.
 */
contract PaymentManager is IPaymentManager, ContractAddressLocatorHolder, Claimable {
    string public constant VERSION = "1.0.0";

    using Math for uint256;

    uint256 public maxNumOfPaymentsLimit = 30;

    event PaymentRegistered(address indexed _user, uint256 _input, uint256 _output);
    event PaymentSettled(address indexed _user, uint256 _input, uint256 _output);
    event PaymentPartialSettled(address indexed _user, uint256 _input, uint256 _output);

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
     * @dev Return the contract which implements the IETHConverter interface.
     */
    function getETHConverter() public view returns (IETHConverter) {
        return IETHConverter(getContractAddress(_IETHConverter_));
    }

    /**
     * @dev Return the contract which implements the IPaymentHandler interface.
     */
    function getPaymentHandler() public view returns (IPaymentHandler) {
        return IPaymentHandler(getContractAddress(_IPaymentHandler_));
    }

    /**
     * @dev Return the contract which implements the IPaymentQueue interface.
     */
    function getPaymentQueue() public view returns (IPaymentQueue) {
        return IPaymentQueue(getContractAddress(_IPaymentQueue_));
    }

    /**
    * @dev Set the max number of outstanding payments that can be settled in a single transaction.
    * @param _maxNumOfPaymentsLimit The maximum number of outstanding payments to settle in a single transaction.
    */
    function setMaxNumOfPaymentsLimit(uint256 _maxNumOfPaymentsLimit) external onlyOwner {
        require(_maxNumOfPaymentsLimit > 0, "invalid _maxNumOfPaymentsLimit");
        maxNumOfPaymentsLimit = _maxNumOfPaymentsLimit;
    }

    /**
     * @dev Retrieve the current number of outstanding payments.
     * @return The current number of outstanding payments.
     */
    function getNumOfPayments() external view returns (uint256) {
        return getPaymentQueue().getNumOfPayments();
    }

    /**
     * @dev Retrieve the sum of all outstanding payments.
     * @return The sum of all outstanding payments.
     */
    function getPaymentsSum() external view returns (uint256) {
        return getPaymentQueue().getPaymentsSum();
    }

    /**
     * @dev Compute differ payment.
     * @param _ethAmount The amount of ETH entitled by the client.
     * @param _ethBalance The amount of ETH retained by the payment handler.
     * @return The amount of differed ETH payment.
     */
    function computeDifferPayment(uint256 _ethAmount, uint256 _ethBalance) external view returns (uint256) {
        if (getPaymentQueue().getNumOfPayments() > 0)
            return _ethAmount;
        else if (_ethAmount > _ethBalance)
            return _ethAmount - _ethBalance; // will never underflow
        else
            return 0;
    }

    /**
     * @dev Register a differed payment.
     * @param _wallet The payment wallet address.
     * @param _ethAmount The payment amount in ETH.
     */
    function registerDifferPayment(address _wallet, uint256 _ethAmount) external only(_ISGATokenManager_) {
        uint256 sdrAmount = getETHConverter().fromEthAmount(_ethAmount);
        getPaymentQueue().addPayment(_wallet, sdrAmount);
        emit PaymentRegistered(_wallet, _ethAmount, sdrAmount);
    }

    /**
     * @dev Settle payments by chronological order of registration.
     * @param _maxNumOfPayments The maximum number of payments to handle.
     */
    function settlePayments(uint256 _maxNumOfPayments) external {
        require(getSGAAuthorizationManager().isAuthorizedForPublicOperation(msg.sender), "settle payments is not authorized");
        IETHConverter ethConverter = getETHConverter();
        IPaymentHandler paymentHandler = getPaymentHandler();
        IPaymentQueue paymentQueue = getPaymentQueue();

        uint256 numOfPayments = paymentQueue.getNumOfPayments();
        numOfPayments =  numOfPayments.min(_maxNumOfPayments).min(maxNumOfPaymentsLimit);

        for (uint256 i = 0; i < numOfPayments; i++) {
            (address wallet, uint256 sdrAmount) = paymentQueue.getPayment(0);
            uint256 ethAmount = ethConverter.toEthAmount(sdrAmount);
            uint256 ethBalance = paymentHandler.getEthBalance();
            if (ethAmount > ethBalance) {
                paymentQueue.updatePayment(ethConverter.fromEthAmount(ethAmount - ethBalance)); // will never underflow
                paymentHandler.transferEthToSgaHolder(wallet, ethBalance);
                emit PaymentPartialSettled(wallet, sdrAmount, ethBalance);
                break;
            }
            paymentQueue.removePayment();
            paymentHandler.transferEthToSgaHolder(wallet, ethAmount);
            emit PaymentSettled(wallet, sdrAmount, ethAmount);
        }
    }
}
