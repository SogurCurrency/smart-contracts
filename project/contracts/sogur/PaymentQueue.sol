pragma solidity 0.4.25;

import "./interfaces/IPaymentQueue.sol";
import "./interfaces/ISGRAuthorizationManager.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title Payment Queue.
 */
contract PaymentQueue is IPaymentQueue, ContractAddressLocatorHolder {
    string public constant VERSION = "2.0.0";

    using SafeMath for uint256;

    struct Payment {
        address wallet;
        uint256 amount;
    }

    Payment[] public payments;
    uint256 public first;
    uint256 public last;

    uint256 public sum = 0;

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
     * @dev assert if called when the queue is empty.
     */
    modifier assertNonEmpty() {
        assert(last > 0);
        _;
    }

    /**
     * @dev Retrieve the current number of payments.
     * @return The current number of payments.
     */
    function getNumOfPayments() external view returns (uint256) {
        return last.sub(first);
    }

    /**
     * @dev Retrieve the sum of all payments.
     * @return The sum of all payments.
     */
    function getPaymentsSum() external view returns (uint256) {
        return sum;
    }

    /**
     * @dev Retrieve the details of a payment.
     * @param _index The index of the payment.
     * @return The payment's wallet address and amount.
     */
    function getPayment(uint256 _index) external view assertNonEmpty returns (address, uint256)  {
        require(last.sub(first) > _index, "index out of range");
        Payment memory payment = payments[first.add(_index)];
        return (payment.wallet, payment.amount);
    }

    /**
     * @dev Add a new payment.
     * @param _wallet The payment wallet address.
     * @param _amount The payment amount.
     */
    function addPayment(address _wallet, uint256 _amount) external only(_IPaymentManager_) {
        assert(_wallet != address(0) && _amount > 0);
        Payment memory newPayment = Payment({wallet : _wallet, amount : _amount});
        if (payments.length > last)
            payments[last] = newPayment;
        else
            payments.push(newPayment);
        sum = sum.add(_amount);
        last = last.add(1);
    }

    /**
     * @dev Update the first payment.
     * @param _amount The new payment amount.
     */
    function updatePayment(uint256 _amount) external only(_IPaymentManager_) assertNonEmpty {
        assert(_amount > 0);
        sum = (sum.add(_amount)).sub(payments[first].amount);
        payments[first].amount = _amount;

    }

    /**
     * @dev Remove the first payment.
     */
    function removePayment() external only(_IPaymentManager_) assertNonEmpty {
        sum = sum.sub(payments[first].amount);
        payments[first] = Payment({wallet : address(0), amount : 0});
        uint256 newFirstPosition = first.add(1);
        if (newFirstPosition == last)
            first = last = 0;
        else
            first = newFirstPosition;
    }

    /**
     * @dev Clean the queue.
     * @param _maxCleanLength The maximum payments to clean.
     */
    function clean(uint256 _maxCleanLength) external {
        require(getSGRAuthorizationManager().isAuthorizedForPublicOperation(msg.sender), "clean queue is not authorized");
        uint256 paymentsQueueLength = payments.length;
        if (paymentsQueueLength > last) {
            uint256 totalPaymentsToClean = paymentsQueueLength.sub(last);
            payments.length = (totalPaymentsToClean < _maxCleanLength) ? last : paymentsQueueLength.sub(_maxCleanLength);
        }
        
    }
}
