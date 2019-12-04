pragma solidity 0.4.25;

import "../interfaces/ISGAAuthorizationManager.sol";

contract SGAAuthorizationManagerMockup is ISGAAuthorizationManager {
    bool private state;

    function setState(bool _state) external {
        state = _state;
    }

    function isAuthorizedToBuy(address _sender) external view returns (bool) {
        _sender;
        return state;
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

    function isAuthorizedForPublicOperation(address _sender) external view returns (bool) {
        _sender;
        return state;
    }
}
