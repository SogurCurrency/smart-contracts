pragma solidity 0.4.25;

import "./interfaces/IMonetaryModel.sol";
import "./interfaces/IReconciliationAdjuster.sol";
import "./interfaces/ITransactionManager.sol";
import "./interfaces/ITransactionLimiter.sol";
import "./interfaces/IETHConverter.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Transaction Manager.
 */
contract TransactionManager is ITransactionManager, ContractAddressLocatorHolder {
    string public constant VERSION = "1.0.0";

    event TransactionManagerBuyCompleted(uint256 _amount);
    event TransactionManagerSellCompleted(uint256 _amount);

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
     * @dev Return the contract which implements the IMonetaryModel interface.
     */
    function getMonetaryModel() public view returns (IMonetaryModel) {
        return IMonetaryModel(getContractAddress(_IMonetaryModel_));
    }

    /**
     * @dev Return the contract which implements the IReconciliationAdjuster interface.
     */
    function getReconciliationAdjuster() public view returns (IReconciliationAdjuster) {
        return IReconciliationAdjuster(getContractAddress(_IReconciliationAdjuster_));
    }

    /**
     * @dev Return the contract which implements the ITransactionLimiter interface.
     */
    function getTransactionLimiter() public view returns (ITransactionLimiter) {
        return ITransactionLimiter(getContractAddress(_ITransactionLimiter_));
    }

    /**
     * @dev Return the contract which implements the IETHConverter interface.
     */
    function getETHConverter() public view returns (IETHConverter) {
        return IETHConverter(getContractAddress(_IETHConverter_));
    }

    /**
     * @dev Buy SGA in exchange for ETH.
     * @param _ethAmount The amount of ETH received from the buyer.
     * @return The amount of SGA that the buyer is entitled to receive.
     */
    function buy(uint256 _ethAmount) external only(_ISGATokenManager_) returns (uint256) {
        uint256 sdrAmount = getETHConverter().toSdrAmount(_ethAmount);
        uint256 newAmount = getReconciliationAdjuster().adjustBuy(sdrAmount);
        uint256 sgaAmount = getMonetaryModel().buy(newAmount);
        getTransactionLimiter().incTotalBuy(sdrAmount);
        emit TransactionManagerBuyCompleted(sdrAmount);
        return sgaAmount;
    }

    /**
     * @dev Sell SGA in exchange for ETH.
     * @param _sgaAmount The amount of SGA received from the seller.
     * @return The amount of ETH that the seller is entitled to receive.
     */
    function sell(uint256 _sgaAmount) external only(_ISGATokenManager_) returns (uint256) {
        uint256 sdrAmount = getMonetaryModel().sell(_sgaAmount);
        uint256 newAmount = getReconciliationAdjuster().adjustSell(sdrAmount);
        uint256 ethAmount = getETHConverter().toEthAmount(newAmount);
        getTransactionLimiter().incTotalSell(sdrAmount);
        emit TransactionManagerSellCompleted(newAmount);
        return ethAmount;
    }
}
