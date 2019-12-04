pragma solidity 0.4.25;

import "./interfaces/IContractAddressLocator.sol";
import "openzeppelin-solidity-v1.12.0/contracts/ownership/Claimable.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Contract Address Locator Proxy.
 * @dev Hold a contract address locator, which maps a unique identifier to every contract address in the system.
 * @dev On-chain, this contract is used for retrieving the address of any contract in the system.
 * @dev Off-chain, this contract may be used for replacing the contract address locator itself.
 * @dev Thus, system-upgrade (full or partial) can be executed as an atomic operation.
 */
contract ContractAddressLocatorProxy is IContractAddressLocator, Claimable {
    string public constant VERSION = "1.0.0";

    IContractAddressLocator private contractAddressLocator;

    event Upgraded(IContractAddressLocator indexed _prev, IContractAddressLocator indexed _next);

    /**
     * @dev Get the contract address locator.
     * @return The contract address locator.
     */
    function getContractAddressLocator() external view returns (IContractAddressLocator) {
        return contractAddressLocator;
    }

    /**
     * @dev Get the contract address mapped to a given identifier.
     * @param _identifier The identifier.
     * @return The contract address.
     */
    function getContractAddress(bytes32 _identifier) external view returns (address) {
        return contractAddressLocator.getContractAddress(_identifier);
    }

    /**
     * @dev Determine whether or not a contract address relates to one of the identifiers.
     * @param _contractAddress The contract address to look for.
     * @param _identifiers The identifiers.
     * @return A boolean indicating if the contract address relates to one of the identifiers.
     */
    function isContractAddressRelates(address _contractAddress, bytes32[] _identifiers) external view returns (bool){
        return contractAddressLocator.isContractAddressRelates(_contractAddress, _identifiers);
    }

    /**
     * @dev Replace the contract address locator.
     * @param _contractAddressLocator A new contract address locator.
     */
    function upgrade(IContractAddressLocator _contractAddressLocator) external onlyOwner {
        require(_contractAddressLocator != address(0), "locator is illegal");
        emit Upgraded(contractAddressLocator, _contractAddressLocator);
        contractAddressLocator = _contractAddressLocator;
    }
}
