pragma solidity 0.4.25;

import "../interfaces/IAuthorizationDataSource.sol";

contract AuthorizationDataSourceMockup is IAuthorizationDataSource {
    struct WalletInfo {
        bool isWhitelisted;
        uint256 actionRole;
        uint256 tradeLimit;
        uint256 tradeClass;
    }

    mapping(address => WalletInfo) private walletTable;

    function getAuthorizedActionRole(address _wallet) external view returns (bool, uint256) {
        return (walletTable[_wallet].isWhitelisted, walletTable[_wallet].actionRole);
    }

    function getTradeLimitAndClass(address _wallet) external view returns (uint256, uint256) {
        return (walletTable[_wallet].tradeLimit, walletTable[_wallet].tradeClass);
    }

    function set(address _wallet, bool _isWhitelisted, uint256 _actionRole, uint256 _tradeLimit, uint256 _tradeClass) external {
        walletTable[_wallet] = WalletInfo({isWhitelisted: _isWhitelisted, actionRole: _actionRole, tradeLimit: _tradeLimit, tradeClass: _tradeClass});
    }
}
