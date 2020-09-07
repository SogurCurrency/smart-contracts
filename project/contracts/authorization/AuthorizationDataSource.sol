pragma solidity 0.4.25;

import "../utils/Adminable.sol";
import "./interfaces/IAuthorizationDataSource.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title Authorization Data Source.
 */
contract AuthorizationDataSource is IAuthorizationDataSource, Adminable {
    string public constant VERSION = "2.0.0";

    uint256 public walletCount;

    struct WalletInfo {
        uint256 sequenceNum;
        bool isWhitelisted;
        uint256 actionRole;
        uint256 buyLimit;
        uint256 sellLimit;
        uint256 tradeClass;
    }

    mapping(address => WalletInfo) public walletTable;

    event WalletSaved(address indexed _wallet);
    event WalletDeleted(address indexed _wallet);
    event WalletNotSaved(address indexed _wallet);
    event WalletNotDeleted(address indexed _wallet);

    /**
     * @dev Get the authorized action-role of a wallet.
     * @param _wallet The address of the wallet.
     * @return The authorized action-role of the wallet.
     */
    function getAuthorizedActionRole(address _wallet) external view returns (bool, uint256) {
        WalletInfo storage walletInfo = walletTable[_wallet];
        return (walletInfo.isWhitelisted, walletInfo.actionRole);
    }

    /**
     * @dev Get the authorized action-role and trade-class of a wallet.
     * @param _wallet The address of the wallet.
     * @return The authorized action-role and class of the wallet.
     */
    function getAuthorizedActionRoleAndClass(address _wallet) external view returns (bool, uint256, uint256) {
        WalletInfo storage walletInfo = walletTable[_wallet];
        return (walletInfo.isWhitelisted, walletInfo.actionRole, walletInfo.tradeClass);
    }

    /**
     * @dev Get all the trade-limits and trade-class of a wallet.
     * @param _wallet The address of the wallet.
     * @return The trade-limits and trade-class of the wallet.
     */
    function getTradeLimitsAndClass(address _wallet) external view returns (uint256, uint256, uint256) {
        WalletInfo storage walletInfo = walletTable[_wallet];
        return (walletInfo.buyLimit, walletInfo.sellLimit, walletInfo.tradeClass);
    }

    /**
     * @dev Get the buy trade-limit and trade-class of a wallet.
     * @param _wallet The address of the wallet.
     * @return The buy trade-limit and trade-class of the wallet.
     */
    function getBuyTradeLimitAndClass(address _wallet) external view returns (uint256, uint256) {
        WalletInfo storage walletInfo = walletTable[_wallet];
        return (walletInfo.buyLimit, walletInfo.tradeClass);
    }

    /**
     * @dev Get the sell trade-limit and trade-class of a wallet.
     * @param _wallet The address of the wallet.
     * @return The sell trade-limit and trade-class of the wallet.
     */
    function getSellTradeLimitAndClass(address _wallet) external view returns (uint256, uint256) {
        WalletInfo storage walletInfo = walletTable[_wallet];
        return (walletInfo.sellLimit, walletInfo.tradeClass);
    }

    /**
     * @dev Insert or update a wallet.
     * @param _wallet The address of the wallet.
     * @param _sequenceNum The sequence-number of the operation.
     * @param _isWhitelisted The authorization of the wallet.
     * @param _actionRole The action-role of the wallet.
     * @param _buyLimit The buy trade-limit of the wallet.
     * @param _sellLimit The sell trade-limit of the wallet.
     * @param _tradeClass The trade-class of the wallet.
     */
    function upsertOne(address _wallet, uint256 _sequenceNum, bool _isWhitelisted, uint256 _actionRole, uint256 _buyLimit, uint256 _sellLimit, uint256 _tradeClass) external onlyAdmin {
        _upsert(_wallet, _sequenceNum, _isWhitelisted, _actionRole, _buyLimit, _sellLimit, _tradeClass);
    }

    /**
     * @dev Remove a wallet.
     * @param _wallet The address of the wallet.
     */
    function removeOne(address _wallet) external onlyAdmin {
        _remove(_wallet);
    }

    /**
     * @dev Insert or update a list of wallets with the same params.
     * @param _wallets The addresses of the wallets.
     * @param _sequenceNum The sequence-number of the operation.
     * @param _isWhitelisted The authorization of all the wallets.
     * @param _actionRole The action-role of all the the wallets.
     * @param _buyLimit The buy trade-limit of all the wallets.
     * @param _sellLimit The sell trade-limit of all the wallets.
     * @param _tradeClass The trade-class of all the wallets.
     */
    function upsertAll(address[] _wallets, uint256 _sequenceNum, bool _isWhitelisted, uint256 _actionRole, uint256 _buyLimit, uint256 _sellLimit, uint256 _tradeClass) external onlyAdmin {
        for (uint256 i = 0; i < _wallets.length; i++)
            _upsert(_wallets[i], _sequenceNum, _isWhitelisted, _actionRole, _buyLimit, _sellLimit, _tradeClass);
    }

    /**
     * @dev Remove a list of wallets.
     * @param _wallets The addresses of the wallets.
     */
    function removeAll(address[] _wallets) external onlyAdmin {
        for (uint256 i = 0; i < _wallets.length; i++)
            _remove(_wallets[i]);
    }

    /**
     * @dev Insert or update a wallet.
     * @param _wallet The address of the wallet.
     * @param _sequenceNum The sequence-number of the operation.
     * @param _isWhitelisted The authorization of the wallet.
     * @param _actionRole The action-role of the wallet.
     * @param _buyLimit The buy trade-limit of the wallet.
     * @param _sellLimit The sell trade-limit of the wallet.
     * @param _tradeClass The trade-class of the wallet.
     */
    function _upsert(address _wallet, uint256 _sequenceNum, bool _isWhitelisted, uint256 _actionRole, uint256 _buyLimit, uint256 _sellLimit, uint256 _tradeClass) private {
        require(_wallet != address(0), "wallet is illegal");
        WalletInfo storage walletInfo = walletTable[_wallet];
        if (walletInfo.sequenceNum < _sequenceNum) {
            if (walletInfo.sequenceNum == 0) // increment the wallet-count only when a new wallet is inserted
                walletCount += 1; // will never overflow because the number of different wallets = 2^160 < 2^256
            walletInfo.sequenceNum = _sequenceNum;
            walletInfo.isWhitelisted = _isWhitelisted;
            walletInfo.actionRole = _actionRole;
            walletInfo.buyLimit = _buyLimit;
            walletInfo.sellLimit = _sellLimit;
            walletInfo.tradeClass = _tradeClass;
            emit WalletSaved(_wallet);
        }
        else {
            emit WalletNotSaved(_wallet);
        }
    }

    /**
     * @dev Remove a wallet.
     * @param _wallet The address of the wallet.
     */
    function _remove(address _wallet) private {
        require(_wallet != address(0), "wallet is illegal");
        WalletInfo storage walletInfo = walletTable[_wallet];
        if (walletInfo.sequenceNum > 0) { // decrement the wallet-count only when an existing wallet is removed
            walletCount -= 1; // will never underflow because every decrement follows a corresponding increment
            delete walletTable[_wallet];
            emit WalletDeleted(_wallet);
        }
        else {
            emit WalletNotDeleted(_wallet);
        }
    }
}
