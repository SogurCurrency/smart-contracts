pragma solidity 0.4.25;

import "./interfaces/IPaymentHandler.sol";
import "./interfaces/IMintListener.sol";
import "./interfaces/ISGATokenManager.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "../saga-genesis/interfaces/ISagaExchanger.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Saga Token.
 * @dev ERC20 compatible.
 * @dev Exchange ETH for SGA.
 * @dev Exchange SGA for ETH.
 */
contract SGAToken is ERC20, ContractAddressLocatorHolder, IMintListener, ISagaExchanger, IPaymentHandler {
    string public constant VERSION = "1.0.0";

    string public constant name = "Saga";
    string public constant symbol = "SGA";
    uint8  public constant decimals = 18;

    /**
     * @dev Public Address 0x10063FCCf5eEE46fC65D399a7F5dd88730906CF9.
     * @notice SGA will be minted at this public address for SGN holders.
     * @notice SGA will be transferred from this public address upon conversion by an SGN holder.
     * @notice It is generated in a manner which ensures that the corresponding private key is unknown.
     */
    address public constant SGA_MINTED_FOR_SGN_HOLDERS = address(keccak256("SGA_MINTED_FOR_SGN_HOLDERS"));

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
     * @dev Return the contract which implements the ISGATokenManager interface.
     */
    function getSGATokenManager() public view returns (ISGATokenManager) {
        return ISGATokenManager(getContractAddress(_ISGATokenManager_));
    }

    /**
     * @dev Exchange ETH for SGA.
     * @notice Can be executed from externally-owned accounts but not from other contracts.
     * @notice This is due to the insufficient gas-stipend provided to the fallback function.
     */
    function() external payable {
        uint256 amount = getSGATokenManager().exchangeEthForSga(msg.sender, msg.value);
        _mint(msg.sender, amount);
    }

    /**
     * @dev Exchange ETH for SGA.
     * @notice Can be executed from externally-owned accounts as well as from other contracts.
     */
    function exchange() external payable {
        uint256 amount = getSGATokenManager().exchangeEthForSga(msg.sender, msg.value);
        _mint(msg.sender, amount);
    }

    /**
     * @dev Transfer SGA to another account.
     * @param _to The address of the destination account.
     * @param _value The amount of SGA to be transferred.
     * @return Status (true if completed successfully, false otherwise).
     * @notice If the destination account is this contract, then exchange SGA for ETH.
     */
    function transfer(address _to, uint256 _value) public returns (bool) {
        if (_to == address(this)) {
            uint256 amount = getSGATokenManager().exchangeSgaForEth(msg.sender, _value);
            _burn(msg.sender, _value);
            msg.sender.transfer(amount);
            return true;
        }
        getSGATokenManager().uponTransfer(msg.sender, _to, _value);
        return super.transfer(_to, _value);
    }

    /**
     * @dev Transfer SGA from one account to another.
     * @param _from The address of the source account.
     * @param _to The address of the destination account.
     * @param _value The amount of SGA to be transferred.
     * @return Status (true if completed successfully, false otherwise).
     * @notice If the destination account is this contract, then the operation is illegal.
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_to != address(this), "custodian-transfer of SGA into this contract is illegal");
        getSGATokenManager().uponTransferFrom(msg.sender, _from, _to, _value);
        return super.transferFrom(_from, _to, _value);
    }

    /**
     * @dev Deposit ETH into this contract.
     */
    function deposit() external payable {
        getSGATokenManager().uponDeposit(msg.sender, address(this).balance, msg.value);
    }

    /**
     * @dev Withdraw ETH from this contract.
     */
    function withdraw() external {
        (address wallet, uint256 amount) = getSGATokenManager().uponWithdraw(msg.sender, address(this).balance);
        wallet.transfer(amount);
    }

    /**
     * @dev Mint SGA for SGN holders.
     * @param _value The amount of SGA to mint.
     */
    function mintSgaForSgnHolders(uint256 _value) external only(_IMintManager_) {
        getSGATokenManager().uponMintSgaForSgnHolders(_value);
        _mint(SGA_MINTED_FOR_SGN_HOLDERS, _value);
    }

    /**
     * @dev Transfer SGA to an SGN holder.
     * @param _to The address of the SGN holder.
     * @param _value The amount of SGA to transfer.
     */
    function transferSgaToSgnHolder(address _to, uint256 _value) external only(_ISGNToken_) {
        getSGATokenManager().uponTransferSgaToSgnHolder(_to, _value);
        _transfer(SGA_MINTED_FOR_SGN_HOLDERS, _to, _value);
    }

    /**
     * @dev Transfer ETH to an SGA holder.
     * @param _to The address of the SGA holder.
     * @param _value The amount of ETH to transfer.
     */
    function transferEthToSgaHolder(address _to, uint256 _value) external only(_IPaymentManager_) {
        bool status = _to.send(_value);
        getSGATokenManager().postTransferEthToSgaHolder(_to, _value, status);
    }

    /**
     * @dev Get the amount of available ETH.
     * @return The amount of available ETH.
     */
    function getEthBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get the address of the reserve-wallet and the deficient amount of ETH in this contract.
     * @return The address of the reserve-wallet and the deficient amount of ETH in this contract.
     */
    function getDepositParams() external view returns (address, uint256) {
        return getSGATokenManager().getDepositParams();
    }

    /**
     * @dev Get the address of the reserve-wallet and the excessive amount of ETH in this contract.
     * @return The address of the reserve-wallet and the excessive amount of ETH in this contract.
     */
    function getWithdrawParams() external view returns (address, uint256) {
        return getSGATokenManager().getWithdrawParams();
    }
}
