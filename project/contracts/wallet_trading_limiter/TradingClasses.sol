pragma solidity 0.4.25;

import "./interfaces/ITradingClasses.sol";
import "openzeppelin-solidity-v1.12.0/contracts/ownership/Claimable.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Trading Classes.
 */
contract TradingClasses is ITradingClasses, Claimable {
    string public constant VERSION = "1.0.0";

    uint256[] public array;

    struct Info {
        uint256 limit;
        uint256 index;
    }

    mapping(uint256 => Info) public table;

    enum Action {None, Insert, Update, Remove}

    event ActionCompleted(uint256 _id, uint256 _limit, Action _action);

    /**
     * @dev Get the limit of a class.
     * @param _id The id of the class.
     * @return The limit of the class.
     */
    function getLimit(uint256 _id) external view returns (uint256) {
        return table[_id].limit;
    }

    /**
     * @dev Set the limit of a class.
     * @param _id The id of the class.
     * @param _limit The limit of the class.
     */
    function setLimit(uint256 _id, uint256 _limit) external onlyOwner {
        Info storage info = table[_id];
        Action action = getAction(info.limit, _limit);
        if (action == Action.Insert) {
            info.index = array.length;
            info.limit = _limit;
            array.push(_id);
        }
        else if (action == Action.Update) {
            info.limit = _limit;
        }
        else if (action == Action.Remove) {
            // at this point we know that array.length > info.index >= 0
            uint256 last = array[array.length - 1]; // will never underflow
            table[last].index = info.index;
            array[info.index] = last;
            array.length -= 1; // will never underflow
            delete table[_id];
        }
        emit ActionCompleted(_id, _limit, action);
    }

    /**
     * @dev Get an array of all the classes.
     * @return An array of all the classes.
     */
    function getArray() external view returns (uint256[] memory) {
        return array;
    }

    /**
     * @dev Get the total number of classes.
     * @return The total number of classes.
     */
    function getCount() external view returns (uint256) {
        return array.length;
    }

    /**
     * @dev Get the required action.
     * @param _prev The old limit.
     * @param _next The new limit.
     * @return The required action.
     */
    function getAction(uint256 _prev, uint256 _next) private pure returns (Action) {
        if (_prev == 0 && _next != 0)
            return Action.Insert;
        if (_prev != 0 && _next == 0)
            return Action.Remove;
        if (_prev != _next)
            return Action.Update;
        return Action.None;
    }
}
