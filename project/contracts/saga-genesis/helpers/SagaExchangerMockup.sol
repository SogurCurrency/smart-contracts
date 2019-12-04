pragma solidity 0.4.25;

import "../interfaces/ISagaExchanger.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract SagaExchangerMockup is ISagaExchanger, ERC20 {
    address public constant SGA_MINTED_FOR_SGN_HOLDERS = address(keccak256("SGA_MINTED_FOR_SGN_HOLDERS"));

    function mintSgaForSgnHolders(uint256 _value) external {
        _mint(SGA_MINTED_FOR_SGN_HOLDERS, _value);
    }

    function transferSgaToSgnHolder(address _to, uint256 _value) external {
        _transfer(SGA_MINTED_FOR_SGN_HOLDERS, _to, _value);
    }
}
