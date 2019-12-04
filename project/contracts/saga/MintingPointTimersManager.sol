pragma solidity 0.4.25;

import "./interfaces/IMintingPointTimersManager.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Minting Point Timers Manager.
 */
contract MintingPointTimersManager is IMintingPointTimersManager, ContractAddressLocatorHolder {
    string public constant VERSION = "1.0.0";

    using SafeMath for uint256;

    struct Timestamp {
        bool valid;
        uint256 value;
    }

    uint256 public timeout;
    Timestamp[105] public timestamps;

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     * @param _timeout The number of seconds elapsed between 'running' and 'expired'.
     * @notice Each timestamp can be in either one of 3 states: 'running', 'expired' or 'invalid'.
     */
    constructor(IContractAddressLocator _contractAddressLocator, uint256 _timeout) ContractAddressLocatorHolder(_contractAddressLocator) public {
        timeout = _timeout;
    }

    /**
     * @dev Start a given timestamp.
     * @param _id The ID of the timestamp.
     * @notice When tested, this timestamp will be either 'running' or 'expired'.
     */
    function start(uint256 _id) external only(_IIntervalIterator_) {
        Timestamp storage timestamp = timestamps[_id];
        assert(!timestamp.valid);
        timestamp.valid = true;
        timestamp.value = time();
    }

    /**
     * @dev Reset a given timestamp.
     * @param _id The ID of the timestamp.
     * @notice When tested, this timestamp will be neither 'running' nor 'expired'.
     */
    function reset(uint256 _id) external only(_IIntervalIterator_) {
        Timestamp storage timestamp = timestamps[_id];
        assert(timestamp.valid);
        timestamp.valid = false;
        timestamp.value = 0;
    }

    /**
     * @dev Get an indication of whether or not a given timestamp is 'running'.
     * @param _id The ID of the timestamp.
     * @return An indication of whether or not a given timestamp is 'running'.
     * @notice Even if this timestamp is not 'running', it is not necessarily 'expired'.
     */
    function running(uint256 _id) external view returns (bool) {
        Timestamp storage timestamp = timestamps[_id];
        if (!timestamp.valid)
            return false;
        return timestamp.value.add(timeout) >= time();
    }

    /**
     * @dev Get an indication of whether or not a given timestamp is 'expired'.
     * @param _id The ID of the timestamp.
     * @return An indication of whether or not a given timestamp is 'expired'.
     * @notice Even if this timestamp is not 'expired', it is not necessarily 'running'.
     */
    function expired(uint256 _id) external view returns (bool) {
        Timestamp storage timestamp = timestamps[_id];
        if (!timestamp.valid)
            return false;
        return timestamp.value.add(timeout) < time();
    }

    /**
     * @dev Return the current time (equivalent to `block.timestamp`).
     * @notice This function can be overridden in order to perform artificial time-simulation.
     */
    function time() internal view returns (uint256) {
        return now;
    }
}
