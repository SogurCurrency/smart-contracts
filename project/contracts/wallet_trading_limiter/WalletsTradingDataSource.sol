pragma solidity 0.4.25;

import "../utils/Adminable.sol";
import "./interfaces/IWalletsTradingDataSource.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title Wallets Trading Data Source.
 */
contract WalletsTradingDataSource is IWalletsTradingDataSource, ContractAddressLocatorHolder, Adminable {
    string public constant VERSION = "1.1.0";

    using SafeMath for uint256;

    mapping(address => uint256) public values;

    bytes32[] public authorizedExecutorsIdentifier;

    event TradingWalletUpdated(address indexed _wallet, uint256 _value, uint256 _limit, uint256 _newValue);

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
     * @dev Reverts if called by any address other than one of the authorized executors.
     */
    modifier onlyAuthorizedExecutors {
        require(isSenderAddressRelates(authorizedExecutorsIdentifier), "caller is illegal");
        _;
    }

    /**
     * @dev Set the authorized executors identifier.
     * @param _authorizedExecutorsIdentifier The authorized executors identifier list.
     */
    function setAuthorizedExecutorsIdentifier(bytes32[] _authorizedExecutorsIdentifier) external onlyOwner {
        authorizedExecutorsIdentifier = _authorizedExecutorsIdentifier;
    }

    /**
     * @dev Increment the value of a given wallet.
     * @param _wallet The address of the wallet.
     * @param _value The value to increment by.
     * @param _limit The limit of the wallet.
     */
    function updateWallet(address _wallet, uint256 _value, uint256 _limit) external onlyAuthorizedExecutors {
        uint256 value = values[_wallet].add(_value);
        require(value <= _limit, "trade-limit has been reached");
        values[_wallet] = value;
        emit TradingWalletUpdated(_wallet, _value, _limit, value);
    }

    /**
     * @dev Reset the values of given wallets.
     * @param _wallets The addresses of the wallets.
     */
    function resetWallets(address[] _wallets) external onlyAdmin {
        for (uint256 i = 0; i < _wallets.length; i++)
            values[_wallets[i]] = 0;
    }
}
