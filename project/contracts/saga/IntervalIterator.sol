pragma solidity 0.4.25;

import "./interfaces/IModelDataSource.sol";
import "./interfaces/IMintingPointTimersManager.sol";
import "./interfaces/IIntervalIterator.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Interval Iterator.
 */
contract IntervalIterator is IIntervalIterator, ContractAddressLocatorHolder {
    string public constant VERSION = "1.0.0";

    uint256 public row;
    uint256 public col;

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
     * @dev Return the contract which implements the IModelDataSource interface.
     */
    function getModelDataSource() public view returns (IModelDataSource) {
        return IModelDataSource(getContractAddress(_IModelDataSource_));
    }

    /**
     * @dev Return the contract which implements the IMintingPointTimersManager interface.
     */
    function getMintingPointTimersManager() public view returns (IMintingPointTimersManager) {
        return IMintingPointTimersManager(getContractAddress(_IMintingPointTimersManager_));
    }

    /**
     * @dev Move to a higher interval and start a corresponding timer if necessary.
     */
    function grow() external only(_IMonetaryModel_) {
        if (col == 0) {
            row += 1;
            getMintingPointTimersManager().start(row);
        }
        else {
            col -= 1;
        }
    }

    /**
     * @dev Reset the timer of the current interval if necessary and move to a lower interval.
     */
    function shrink() external only(_IMonetaryModel_) {
        IMintingPointTimersManager mintingPointTimersManager = getMintingPointTimersManager();
        if (mintingPointTimersManager.running(row)) {
            mintingPointTimersManager.reset(row);
            assert(row > 0);
            row -= 1;
        }
        else {
            col += 1;
        }
    }

    /**
     * @dev Return the current interval.
     */
    function getCurrentInterval() external view returns (uint256, uint256, uint256, uint256, uint256, uint256) {
        return getModelDataSource().getInterval(row, col);
    }

    /**
     * @dev Return the current interval coefficients.
     */
    function getCurrentIntervalCoefs() external view returns (uint256, uint256) {
        return getModelDataSource().getIntervalCoefs(row, col);
    }
}
