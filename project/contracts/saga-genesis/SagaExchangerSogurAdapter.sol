pragma solidity 0.4.25;


import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "./interfaces/ISogurExchanger.sol";
import "./interfaces/ISagaExchanger.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title Saga Exchanger Sogur Adapter.
 * @dev Adapt old saga exchanger interface to the new sogur exchanger interface.
 */
contract SagaExchangerSogurAdapter is ContractAddressLocatorHolder, ISagaExchanger {
    string public constant VERSION = "1.0.0";


    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}


    /**
    * @dev Return the contract which implements ISogurExchanger interface.
    */
    function getSogurExchanger() public view returns (ISogurExchanger) {
        return ISogurExchanger(getContractAddress(_ISogurExchanger_));
    }

    /**
     * @dev Transfer SGR to an SGN holder.
     * @param _to The address of the SGN holder.
     * @param _value The amount of SGR to transfer.
     */
    function transferSgaToSgnHolder(address _to, uint256 _value) external only(_ISGNToken_) {
        getSogurExchanger().transferSgrToSgnHolder(_to, _value);
    }
}
