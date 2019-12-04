pragma solidity 0.4.25;

import "../interfaces/IContractAddressLocator.sol";

contract ContractAddressLocatorMockup is IContractAddressLocator {
    address private isContractAddressRelatesExpectedContractAddressParam;
    bytes32[] private isContractAddressRelatesExpectedIdentifiersParam;

    mapping(bytes32 => address) private contractAddresses;

    function getContractAddress(bytes32 _identifier) external view returns (address) {
        return contractAddresses[_identifier];
    }

    function isContractAddressRelates(address _contractAddress, bytes32[] _identifiers) external view returns (bool){
        if (_contractAddress == isContractAddressRelatesExpectedContractAddressParam && _identifiers.length == isContractAddressRelatesExpectedIdentifiersParam.length) {
            for (uint i = 0; i < _identifiers.length; ++i) {
                if (isContractAddressRelatesExpectedIdentifiersParam[i] != _identifiers[i])
                    return false;
            }
            return true;
        }
        return false;
    }


    function set(bytes32 _identifier, address _contractAddress) external {
        contractAddresses[_identifier] = _contractAddress;
    }

    function setIsContractAddressRelatesExpectedParams(address _contractAddress, bytes32[] _identifiers) external {
        isContractAddressRelatesExpectedContractAddressParam = _contractAddress;
        isContractAddressRelatesExpectedIdentifiersParam = _identifiers;
    }
}
