pragma solidity 0.4.25;

import "../interfaces/IContractAddressLocator.sol";

contract ContractAddressLocatorProxyMockup is IContractAddressLocator {
    bytes32 private isContractAddressRelatesResult;
    address private isContractAddressRelatesExpectedContractAddress;
    mapping(bytes32 => address) private contractAddresses;

    function getContractAddress(bytes32 _identifier) external view returns (address) {
        return contractAddresses[_identifier];
    }

    function isContractAddressRelates(address _contractAddress, bytes32[] _identifiers) external view returns (bool){
        if (isContractAddressRelatesResult == "true")
            return true;
        else if (isContractAddressRelatesResult == "false")
            return false;
        else if (isContractAddressRelatesResult == "require_fail")
            require(false);
        else if (isContractAddressRelatesResult == "check_identifiers") {
            if (_identifiers[0] == "one" && _identifiers[1] == "two")
                return true;
            else
                return false;
        }
        else if (isContractAddressRelatesResult == "check_contract_address")
            return isContractAddressRelatesExpectedContractAddress == _contractAddress;
        require(false, "invalid result requested");
        return true;
    }

    function set(bytes32 _identifier, address _contractAddress) external {
        contractAddresses[_identifier] = _contractAddress;
    }

    function setIsContractAddressRelatesResult(bytes32 result) external {
        isContractAddressRelatesResult = result;
    }

    function setIsContractAddressRelatesExpectedContractAddress(address expectedAddress) external {
        isContractAddressRelatesExpectedContractAddress = expectedAddress;
    }
}
