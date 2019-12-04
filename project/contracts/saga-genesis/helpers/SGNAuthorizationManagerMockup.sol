pragma solidity 0.4.25;

import "../interfaces/ISGNAuthorizationManager.sol";

contract SGNAuthorizationManagerMockup is ISGNAuthorizationManager {
    bool private state;

    function setState(bool _state) external {
        state = _state;
    }

    function isAuthorizedToSell(address _sender) external view returns (bool) {
        _sender;
        return state;
    }

    function isAuthorizedToTransfer(address _sender, address _target) external view returns (bool) {
        _sender;
        _target;
        return state;
    }

    function isAuthorizedToTransferFrom(address _sender, address _source, address _target) external view returns (bool) {
        _sender;
        _source;
        _target;
        return state;
    }
}
