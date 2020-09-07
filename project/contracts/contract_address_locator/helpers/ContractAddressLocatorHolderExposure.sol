pragma solidity 0.4.25;

import "../ContractAddressLocatorHolder.sol";

contract ContractAddressLocatorHolderExposure is ContractAddressLocatorHolder {
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    function functionIsSenderAddressRelates(bytes32[] _identifiers) external view returns (bool) {
        return isSenderAddressRelates(_identifiers);
    }

    function functionGetContractAddress(bytes32 _identifier) external view returns (address) {
        return getContractAddress(_identifier);
    }

    function modifierOnly(bytes32 _identifier) external view only(_identifier) {
    }
}
