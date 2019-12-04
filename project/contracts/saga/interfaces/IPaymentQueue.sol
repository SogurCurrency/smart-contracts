pragma solidity 0.4.25;

/**
 * @title Payment Queue Interface.
 */
interface IPaymentQueue {
    /**
     * @dev Retrieve the current number of payments.
     * @return The current number of payments.
     */
    function getNumOfPayments() external view returns (uint256);

    /**
     * @dev Retrieve the sum of all payments.
     * @return The sum of all payments.
     */
    function getPaymentsSum() external view returns (uint256);

    /**
     * @dev Retrieve the details of a payment.
     * @param _index The index of the payment.
     * @return The payment wallet address and amount.
     */
    function getPayment(uint256 _index) external view returns (address, uint256);

    /**
     * @dev Add a new payment.
     * @param _wallet The payment wallet address.
     * @param _amount The payment amount.
     */
    function addPayment(address _wallet, uint256 _amount) external;

    /**
     * @dev Update the first payment.
     * @param _amount The new payment amount.
     */
    function updatePayment(uint256 _amount) external;

    /**
     * @dev Remove the first payment.
     */
    function removePayment() external;
}
