pragma solidity 0.4.25;

import "../interfaces/IAuthorizationDataSource.sol";

contract AuthorizationDataSourceMockup is IAuthorizationDataSource {
    struct WalletInfo {
        bool isWhitelisted;
        uint256 actionRole;
        uint256 buyLimit;
        uint256 sellLimit;
        uint256 tradeClass;
    }

    mapping(address => WalletInfo) private walletTable;

    function getAuthorizedActionRole(address _wallet) external view returns (bool, uint256) {
        return (walletTable[_wallet].isWhitelisted, walletTable[_wallet].actionRole);
    }

    function getAuthorizedActionRoleAndClass(address _wallet) external view returns (bool, uint256, uint256) {
        return (walletTable[_wallet].isWhitelisted, walletTable[_wallet].actionRole, walletTable[_wallet].tradeClass);
    }

    function getTradeLimitsAndClass(address _wallet) external view returns (uint256, uint256, uint256) {
        return (walletTable[_wallet].buyLimit, walletTable[_wallet].sellLimit, walletTable[_wallet].tradeClass);
    }

    function getBuyTradeLimitAndClass(address _wallet) external view returns (uint256, uint256) {
        return (walletTable[_wallet].buyLimit, walletTable[_wallet].tradeClass);
    }

    function getSellTradeLimitAndClass(address _wallet) external view returns (uint256, uint256) {
        return (walletTable[_wallet].sellLimit, walletTable[_wallet].tradeClass);
    }

    function set(address _wallet, bool _isWhitelisted, uint256 _actionRole, uint256 _buyLimit, uint256 _sellLimit, uint256 _tradeClass) external {
        walletTable[_wallet] = WalletInfo({isWhitelisted: _isWhitelisted, actionRole: _actionRole, buyLimit: _buyLimit, sellLimit: _sellLimit, tradeClass: _tradeClass});
    }
}
