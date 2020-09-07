pragma solidity 0.4.25;

import "./interfaces/ITransactionLimiter.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity-v1.12.0/contracts/ownership/Claimable.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title Transaction Limiter.
 */
contract TransactionLimiter is ITransactionLimiter, ContractAddressLocatorHolder, Claimable {
    string public constant VERSION = "2.0.0";

    using SafeMath for uint256;

    /**
     * @dev Total buy-amount.
     */
    uint256 public totalBuy;

    /**
     * @dev Total sell-amount.
     */
    uint256 public totalSell;

    /**
     * @dev Maximum buy difference permitted.
     */
    uint256 public maxBuyDiff = uint256(~0);

    /**
     * @dev Maximum sell difference permitted.
     */
    uint256 public maxSellDiff = uint256(~0);

    uint256 public sequenceNum = 0;

    event MaxDiffSaved(uint256 _maxBuyDiff, uint256 _maxSellDiff);
    event MaxDiffNotSaved(uint256 _maxBuyDiff, uint256 _maxSellDiff);

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
     * @dev Set the maximum difference permitted.
     * @param _sequenceNum The sequence-number of the operation.
     * @param _maxBuyDiff The maximum buy difference permitted.
     * @param _maxSellDiff The maximum sell difference permitted.
     */
    function setMaxDiff(uint256 _sequenceNum, uint256 _maxBuyDiff, uint256 _maxSellDiff) external onlyOwner {
        if (sequenceNum < _sequenceNum) {
            sequenceNum = _sequenceNum;
            maxBuyDiff = _maxBuyDiff;
            maxSellDiff = _maxSellDiff;

            emit MaxDiffSaved(_maxBuyDiff, _maxSellDiff);
        }
        else {
            emit MaxDiffNotSaved(_maxBuyDiff, _maxSellDiff);
        }
    }

    /**
     * @dev Reset the total buy-amount and the total sell-amount.
     */
    function resetTotal() external only(_IETHConverter_) {
        totalBuy = 0;
        totalSell = 0;
    }

    /**
     * @dev Increment the total buy-amount.
     * @param _amount The amount to increment by.
     */
    function incTotalBuy(uint256 _amount) external only(_ITransactionManager_) {
        totalBuy = totalBuy.add(_amount);
        if (totalBuy > totalSell)
            require(totalBuy - totalSell <= maxBuyDiff, "buy-limit has been reached");
    }

    /**
     * @dev Increment the total sell-amount.
     * @param _amount The amount to increment by.
     */
    function incTotalSell(uint256 _amount) external only(_ITransactionManager_) {
        totalSell = totalSell.add(_amount);
        if (totalSell > totalBuy)
            require(totalSell - totalBuy <= maxSellDiff, "sell-limit has been reached");
    }
}
