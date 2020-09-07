pragma solidity 0.4.25;

/**
 * @title Transaction Limiter Interface.
 */
interface ITransactionLimiter {
    /**
     * @dev Reset the total buy-amount and the total sell-amount.
     */
    function resetTotal() external;

    /**
     * @dev Increment the total buy-amount.
     * @param _amount The amount to increment by.
     */
    function incTotalBuy(uint256 _amount) external;

    /**
     * @dev Increment the total sell-amount.
     * @param _amount The amount to increment by.
     */
    function incTotalSell(uint256 _amount) external;
}
