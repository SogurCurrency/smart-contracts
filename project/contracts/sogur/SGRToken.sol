pragma solidity 0.4.25;

import "./interfaces/IPaymentHandler.sol";
import "./interfaces/IMintListener.sol";
import "./interfaces/ISGRTokenManager.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "../saga-genesis/interfaces/ISogurExchanger.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./interfaces/ISGRTokenInfo.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title Sogur Token.
 * @dev ERC20 compatible.
 * @dev Exchange ETH for SGR.
 * @dev Exchange SGR for ETH.
 */
contract SGRToken is ERC20, ContractAddressLocatorHolder, IMintListener, ISogurExchanger, IPaymentHandler {
    string public constant VERSION = "2.0.0";

    bool public initialized;

    event SgrTokenInitialized(address indexed _initializer, address _sgaToSGRTokenExchangeAddress, uint256 _sgaToSGRTokenExchangeSGRSupply);


    /**
     * @dev Public Address 0x6e9Cd21f2B9033ea0953943c81A041fe203D5E55.
     * @notice SGR will be minted at this public address for SGN holders.
     * @notice SGR will be transferred from this public address upon conversion by an SGN holder.
     * @notice It is generated in a manner which ensures that the corresponding private key is unknown.
     */
    address public constant SGR_MINTED_FOR_SGN_HOLDERS = address(keccak256("SGR_MINTED_FOR_SGN_HOLDERS"));

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
     * @dev Return the contract which implements the ISGRTokenManager interface.
     */
    function getSGRTokenManager() public view returns (ISGRTokenManager) {
        return ISGRTokenManager(getContractAddress(_ISGRTokenManager_));
    }

    /**
    * @dev Return the contract which implements ISGRTokenInfo interface.
    */
    function getSGRTokenInfo() public view returns (ISGRTokenInfo) {
        return ISGRTokenInfo(getContractAddress(_ISGRTokenInfo_));
    }

    /**
    * @dev Return the sgr token name.
    */
    function name() public view returns (string) {
        return getSGRTokenInfo().getName();
    }

    /**
     * @dev Return the sgr token symbol.
     */
    function symbol() public view returns (string){
        return getSGRTokenInfo().getSymbol();
    }

    /**
     * @dev Return the sgr token number of decimals.
     */
    function decimals() public view returns (uint8){
        return getSGRTokenInfo().getDecimals();
    }

    /**
    * @dev Reverts if called when the contract is already initialized.
    */
    modifier onlyIfNotInitialized() {
        require(!initialized, "contract already initialized");
        _;
    }

    /**
     * @dev Exchange ETH for SGR.
     * @notice Can be executed from externally-owned accounts but not from other contracts.
     * @notice This is due to the insufficient gas-stipend provided to the fallback function.
     */
    function() external payable {
        ISGRTokenManager sgrTokenManager = getSGRTokenManager();
        uint256 amount = sgrTokenManager.exchangeEthForSgr(msg.sender, msg.value);
        _mint(msg.sender, amount);
        sgrTokenManager.afterExchangeEthForSgr(msg.sender, msg.value, amount);
    }

    /**
     * @dev Exchange ETH for SGR.
     * @notice Can be executed from externally-owned accounts as well as from other contracts.
     */
    function exchange() external payable {
        ISGRTokenManager sgrTokenManager = getSGRTokenManager();
        uint256 amount = sgrTokenManager.exchangeEthForSgr(msg.sender, msg.value);
        _mint(msg.sender, amount);
        sgrTokenManager.afterExchangeEthForSgr(msg.sender, msg.value, amount);
    }

    /**
     * @dev Initialize the contract.
     * @param _sgaToSGRTokenExchangeAddress the contract address.
     * @param _sgaToSGRTokenExchangeSGRSupply SGR supply for the SGAToSGRTokenExchange contract.
     */
    function init(address _sgaToSGRTokenExchangeAddress, uint256 _sgaToSGRTokenExchangeSGRSupply) external onlyIfNotInitialized only(_SGAToSGRInitializer_) {
        require(_sgaToSGRTokenExchangeAddress != address(0), "SGA to SGR token exchange address is illegal");
        initialized = true;
        _mint(_sgaToSGRTokenExchangeAddress, _sgaToSGRTokenExchangeSGRSupply);
        emit SgrTokenInitialized(msg.sender, _sgaToSGRTokenExchangeAddress, _sgaToSGRTokenExchangeSGRSupply);
    }


    /**
     * @dev Transfer SGR to another account.
     * @param _to The address of the destination account.
     * @param _value The amount of SGR to be transferred.
     * @return Status (true if completed successfully, false otherwise).
     * @notice If the destination account is this contract, then exchange SGR for ETH.
     */
    function transfer(address _to, uint256 _value) public returns (bool) {
        ISGRTokenManager sgrTokenManager = getSGRTokenManager();
        if (_to == address(this)) {
            uint256 amount = sgrTokenManager.exchangeSgrForEth(msg.sender, _value);
            _burn(msg.sender, _value);
            msg.sender.transfer(amount);
            return sgrTokenManager.afterExchangeSgrForEth(msg.sender, _value, amount);
        }
        sgrTokenManager.uponTransfer(msg.sender, _to, _value);
        bool transferResult = super.transfer(_to, _value);
        return sgrTokenManager.afterTransfer(msg.sender, _to, _value, transferResult);
    }

    /**
     * @dev Transfer SGR from one account to another.
     * @param _from The address of the source account.
     * @param _to The address of the destination account.
     * @param _value The amount of SGR to be transferred.
     * @return Status (true if completed successfully, false otherwise).
     * @notice If the destination account is this contract, then the operation is illegal.
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        ISGRTokenManager sgrTokenManager = getSGRTokenManager();
        require(_to != address(this), "custodian-transfer of SGR into this contract is illegal");
        sgrTokenManager.uponTransferFrom(msg.sender, _from, _to, _value);
        bool transferFromResult = super.transferFrom(_from, _to, _value);
        return sgrTokenManager.afterTransferFrom(msg.sender, _from, _to, _value, transferFromResult);
    }

    /**
     * @dev Deposit ETH into this contract.
     */
    function deposit() external payable {
        getSGRTokenManager().uponDeposit(msg.sender, address(this).balance, msg.value);
    }

    /**
     * @dev Withdraw ETH from this contract.
     */
    function withdraw() external {
        ISGRTokenManager sgrTokenManager = getSGRTokenManager();
        uint256 priorWithdrawEthBalance = address(this).balance;
        (address wallet, uint256 amount) = sgrTokenManager.uponWithdraw(msg.sender, priorWithdrawEthBalance);
        wallet.transfer(amount);
        sgrTokenManager.afterWithdraw(msg.sender, wallet, amount, priorWithdrawEthBalance, address(this).balance);
    }

    /**
     * @dev Mint SGR for SGN holders.
     * @param _value The amount of SGR to mint.
     */
    function mintSgrForSgnHolders(uint256 _value) external only(_IMintManager_) {
        ISGRTokenManager sgrTokenManager = getSGRTokenManager();
        sgrTokenManager.uponMintSgrForSgnHolders(_value);
        _mint(SGR_MINTED_FOR_SGN_HOLDERS, _value);
        sgrTokenManager.afterMintSgrForSgnHolders(_value);
    }

    /**
     * @dev Transfer SGR to an SGN holder.
     * @param _to The address of the SGN holder.
     * @param _value The amount of SGR to transfer.
     */
    function transferSgrToSgnHolder(address _to, uint256 _value) external only(_SgnToSgrExchangeInitiator_) {
        ISGRTokenManager sgrTokenManager = getSGRTokenManager();
        sgrTokenManager.uponTransferSgrToSgnHolder(_to, _value);
        _transfer(SGR_MINTED_FOR_SGN_HOLDERS, _to, _value);
        sgrTokenManager.afterTransferSgrToSgnHolder(_to, _value);
    }

    /**
     * @dev Transfer ETH to an SGR holder.
     * @param _to The address of the SGR holder.
     * @param _value The amount of ETH to transfer.
     */
    function transferEthToSgrHolder(address _to, uint256 _value) external only(_IPaymentManager_) {
        bool status = _to.send(_value);
        getSGRTokenManager().postTransferEthToSgrHolder(_to, _value, status);
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
        return getSGRTokenManager().getDepositParams();
    }

    /**
     * @dev Get the address of the reserve-wallet and the excessive amount of ETH in this contract.
     * @return The address of the reserve-wallet and the excessive amount of ETH in this contract.
     */
    function getWithdrawParams() external view returns (address, uint256) {
        return getSGRTokenManager().getWithdrawParams();
    }
}
