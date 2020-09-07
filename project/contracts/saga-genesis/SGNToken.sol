pragma solidity 0.4.25;

import "./interfaces/IMintHandler.sol";
import "./interfaces/ISagaExchanger.sol";
import "./interfaces/ISGNTokenManager.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title Saga Genesis Token.
 * @dev ERC20 compatible.
 * @dev Exchange SGN for SGA.
 * @notice Some of the code has been auto-generated via 'PrintSGNToken.py',
 * in compliance with 'Saga Monetary Model.pdf' / APPENDIX D: SAGA MODEL POINTS.
 */
contract SGNToken is ERC20, ContractAddressLocatorHolder, IMintHandler {
    string public constant VERSION = "1.0.0";

    string public constant name = "Saga Genesis";
    string public constant symbol = "SGN";
    uint8  public constant decimals = 18;

    address public initialOwner;
    mapping(uint256 => uint256) public valueMintedAt;

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     * @param _initialOwner The initial owner of SGN minted by the model.
     */
    constructor(IContractAddressLocator _contractAddressLocator, address _initialOwner) ContractAddressLocatorHolder(_contractAddressLocator) public {
        initialOwner = _initialOwner;
        uint256 oneToken = uint256(10) ** decimals;
        _mint(initialOwner, 74900000 * oneToken);
        valueMintedAt[16] = 10700000 * oneToken;
        valueMintedAt[26] = 10700000 * oneToken;
        valueMintedAt[36] = 10700000 * oneToken;
    }

    /**
     * @dev Return the contract which implements the ISGNTokenManager interface.
     */
    function getSGNTokenManager() public view returns (ISGNTokenManager) {
        return ISGNTokenManager(getContractAddress(_ISGNTokenManager_));
    }

    /**
     * @dev Return the contract which implements the ISagaExchanger interface.
     */
    function getSagaExchanger() public view returns (ISagaExchanger) {
        return ISagaExchanger(getContractAddress(_ISagaExchanger_));
    }

    /**
     * @dev Get the amount of SGA received upon conversion of a given SGN amount.
     * @param _value The amount of SGN to convert.
     * @return The amount of SGA received upon conversion.
     */
    function convert(uint256 _value) external view returns (uint256) {
        return getSGNTokenManager().convertSgnToSga(_value);
    }

    /**
     * @dev Transfer SGN to another account.
     * @param _to The address of the destination account.
     * @param _value The amount of SGN to be transferred.
     * @return Status (true if completed successfully, false otherwise).
     * @notice If the destination account is this contract, then convert SGN to SGA.
     */
    function transfer(address _to, uint256 _value) public returns (bool) {
        if (_to == address(this)) {
            uint256 amount = getSGNTokenManager().exchangeSgnForSga(msg.sender, _value);
            _burn(msg.sender, _value);
            getSagaExchanger().transferSgaToSgnHolder(msg.sender, amount);
            return true;
        }
        getSGNTokenManager().uponTransfer(msg.sender, _to, _value);
        return super.transfer(_to, _value);
    }

    /**
     * @dev Transfer SGN from one account to another.
     * @param _from The address of the source account.
     * @param _to The address of the destination account.
     * @param _value The amount of SGN to be transferred.
     * @return Status (true if completed successfully, false otherwise).
     * @notice If the destination account is this contract, then the operation is illegal.
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_to != address(this), "custodian-transfer of SGN into this contract is illegal");
        getSGNTokenManager().uponTransferFrom(msg.sender, _from, _to, _value);
        return super.transferFrom(_from, _to, _value);
    }

    /**
     * @dev Upon minting of SGN vested in delay.
     * @param _index The minting-point index.
     */
    function mintSgnVestedInDelay(uint256 _index) external only(_IMintManager_) {
        uint256 value = valueMintedAt[_index];
        valueMintedAt[_index] = 0;
        getSGNTokenManager().uponMintSgnVestedInDelay(value);
        _mint(initialOwner, value);
    }
}
