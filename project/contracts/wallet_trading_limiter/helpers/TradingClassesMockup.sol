pragma solidity 0.4.25;

import "../interfaces/ITradingClasses.sol";


contract TradingClassesMockup is ITradingClasses {
    struct Info {
        uint256 actionRole;
        uint256 buyLimit;
        uint256 sellLimit;
        uint256 index;
    }

    mapping(uint256 => Info) public table;


    function getInfo(uint256 _id) external view returns (uint256, uint256, uint256) {
        _id;
        return (0, 0, 0);
    }

    function getActionRole(uint256 _id) external view returns (uint256) {
        return table[_id].actionRole;
    }


    function getSellLimit(uint256 _id) external view returns (uint256) {
        return table[_id].sellLimit;
    }

    function getBuyLimit(uint256 _id) external view returns (uint256) {
        return table[_id].buyLimit;
    }

    function set(uint256 _id, uint256 _actionRole, uint256 _buyLimit, uint256 _sellLimit) external {
        table[_id] = Info({actionRole : _actionRole, buyLimit : _buyLimit, sellLimit : _sellLimit, index : 0});
    }
}
