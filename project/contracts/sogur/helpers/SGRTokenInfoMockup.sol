pragma solidity 0.4.25;

import "../interfaces/ISGRTokenInfo.sol";

contract SGRTokenInfoMockup is ISGRTokenInfo {

    function getName() public pure returns (string) {
        return "testName";
    }

    function getSymbol() public pure returns (string){
        return "testSymbol";
    }

    function getDecimals() public pure returns (uint8){
        return 18;
    }
}
