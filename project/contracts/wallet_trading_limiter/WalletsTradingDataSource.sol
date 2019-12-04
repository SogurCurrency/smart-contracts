pragma solidity 0.4.25;

import "../utils/Adminable.sol";
import "./interfaces/IWalletsTradingDataSource.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Wallets Trading Data Source.
 */
contract WalletsTradingDataSource is IWalletsTradingDataSource, ContractAddressLocatorHolder, Adminable {
    string public constant VERSION = "1.0.0";

    using SafeMath for uint256;

    mapping(address => uint256) public values;

    bytes32[] public walletTradingLimitersContractLocatorIdentifier;

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {
        bytes32[] memory _walletTradingLimitersContractLocatorIdentifier = new bytes32[](2);
        _walletTradingLimitersContractLocatorIdentifier[0] = _WalletsTradingLimiter_SGNTokenManager_;
        _walletTradingLimitersContractLocatorIdentifier[1] = _WalletsTradingLimiter_SGATokenManager_;
        walletTradingLimitersContractLocatorIdentifier = _walletTradingLimitersContractLocatorIdentifier;
    }

    /**
     * @dev Reverts if called by any address other than one of the wallet trading limiters.
     */
    modifier onlyWalletsTradingLimiters {
        require(isSenderAddressRelates(walletTradingLimitersContractLocatorIdentifier), "caller is illegal");
        _;
    }

    /**
     * @dev Increment the value of a given wallet.
     * @param _wallet The address of the wallet.
     * @param _value The value to increment by.
     * @param _limit The limit of the wallet.
     */
    function updateWallet(address _wallet, uint256 _value, uint256 _limit) external onlyWalletsTradingLimiters {
        uint256 value = values[_wallet].add(_value);
        require(value <= _limit, "trade-limit has been reached");
        values[_wallet] = value;
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
