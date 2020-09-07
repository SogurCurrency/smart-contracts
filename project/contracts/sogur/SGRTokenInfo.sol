pragma solidity 0.4.25;

import "./interfaces/ISGRTokenInfo.sol";


/**
 * @title SGR Token Info.
 */
contract SGRTokenInfo is ISGRTokenInfo{
    string public constant VERSION = "1.0.0";

    /**
     * @return the name of the sgr token.
     */
    function getName() public pure returns (string) {
        return "Sogur";
    }

    /**
     * @return the symbol of the sgr token.
     */
    function getSymbol() public pure returns (string){
        return "SGR";
    }

    /**
     * @return the number of decimals of the sgr token.
     */
    function getDecimals() public pure returns (uint8){
        return 18;
    }

}
