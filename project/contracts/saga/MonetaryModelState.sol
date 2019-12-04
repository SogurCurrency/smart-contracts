pragma solidity 0.4.25;

import "./interfaces/IMonetaryModelState.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Monetary Model State.
 */
contract MonetaryModelState is IMonetaryModelState, ContractAddressLocatorHolder {
    string public constant VERSION = "1.0.0";

    uint256 public sdrTotal;
    uint256 public sgaTotal;

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
     * @dev Set the total amount of SDR in the model.
     * @param _amount The total amount of SDR in the model.
     */
    function setSdrTotal(uint256 _amount) external only(_IMonetaryModel_) {
        sdrTotal = _amount;
    }

    /**
     * @dev Set the total amount of SGA in the model.
     * @param _amount The total amount of SGA in the model.
     */
    function setSgaTotal(uint256 _amount) external only(_IMonetaryModel_) {
        sgaTotal = _amount;
    }

    /**
     * @dev Get the total amount of SDR in the model.
     * @return The total amount of SDR in the model.
     */
    function getSdrTotal() external view returns (uint256) {
        return sdrTotal;
    }

    /**
     * @dev Get the total amount of SGA in the model.
     * @return The total amount of SGA in the model.
     */
    function getSgaTotal() external view returns (uint256) {
        return sgaTotal;
    }
}
