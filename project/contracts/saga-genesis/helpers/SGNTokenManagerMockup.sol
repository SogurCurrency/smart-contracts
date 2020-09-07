pragma solidity 0.4.25;

import "../interfaces/ISGNTokenManager.sol";

contract SGNTokenManagerMockup is ISGNTokenManager {
    function convertSgnToSga(uint256 _sgnAmount) external view returns (uint256) {
        return _sgnAmount;
    }

    function exchangeSgnForSga(address _sender, uint256 _sgnAmount) external returns (uint256) {
        _sender;
        return _sgnAmount;
    }

    function uponTransfer(address _sender, address _to, uint256 _value) external {
        _sender;
        _to;
        _value;
    }

    function uponTransferFrom(address _sender, address _from, address _to, uint256 _value) external {
        _sender;
        _from;
        _to;
        _value;
    }

    function uponMintSgnVestedInDelay(uint256 _value) external {
        _value;
    }
}
