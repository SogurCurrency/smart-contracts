pragma solidity 0.4.25;

import "./interfaces/IMonetaryModelState.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title Monetary Model State.
 */
contract MonetaryModelState is IMonetaryModelState, ContractAddressLocatorHolder {
    string public constant VERSION = "1.1.0";

    bool public initialized;

    uint256 public sdrTotal;
    uint256 public sgrTotal;

    event MonetaryModelStateInitialized(address indexed _initializer, uint256 _sdrTotal, uint256 _sgrTotal);

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
    * @dev Reverts if called when the contract is already initialized.
    */
    modifier onlyIfNotInitialized() {
        require(!initialized, "contract already initialized");
        _;
    }

    /**
    * @dev Initialize the contract.
    * @param _sdrTotal The total amount of SDR in the model.
    * @param _sgrTotal The total amount of SGR in the model.
    */
    function init(uint256 _sdrTotal, uint256 _sgrTotal) external onlyIfNotInitialized only(_SGAToSGRInitializer_) {
        initialized = true;
        sdrTotal = _sdrTotal;
        sgrTotal = _sgrTotal;
        emit MonetaryModelStateInitialized(msg.sender, _sdrTotal, _sgrTotal);
    }

    /**
     * @dev Set the total amount of SDR in the model.
     * @param _amount The total amount of SDR in the model.
     */
    function setSdrTotal(uint256 _amount) external only(_IMonetaryModel_) {
        sdrTotal = _amount;
    }

    /**
     * @dev Set the total amount of SGR in the model.
     * @param _amount The total amount of SGR in the model.
     */
    function setSgrTotal(uint256 _amount) external only(_IMonetaryModel_) {
        sgrTotal = _amount;
    }

    /**
     * @dev Get the total amount of SDR in the model.
     * @return The total amount of SDR in the model.
     */
    function getSdrTotal() external view returns (uint256) {
        return sdrTotal;
    }

    /**
     * @dev Get the total amount of SGR in the model.
     * @return The total amount of SGR in the model.
     */
    function getSgrTotal() external view returns (uint256) {
        return sgrTotal;
    }
}
