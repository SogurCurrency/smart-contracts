pragma solidity 0.4.25;

import "../sogur/MonetaryModelState.sol";
import "../sogur/SGRToken.sol";
import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity-v1.12.0/contracts/ownership/Claimable.sol";
import "../sogur/interfaces/IRedButton.sol";

/**
 * Details of usage of licenced software see here: https://www.sogur.com/software/readme_v1
 */

/**
 * @title SGAToSGRInitializer SGA Monetary Model State Interface.
 */
interface ISGAToSGRInitializerSGAMonetaryModelState {
    /**
     * @dev Get the total amount of SGA in the model.
     * @return The total amount of SGA in the model.
     */
    function getSgaTotal() external view returns (uint256);

    /**
     * @dev Get the total amount of SDR in the model.
     * @return The total amount of SDR in the model.
     */
    function getSdrTotal() external view returns (uint256);
}


/**
 * @title SGA to SGR Initializer.
 */
contract SGAToSGRInitializer is Claimable {
    string public constant VERSION = "1.0.0";

    IRedButton public redButton;
    IERC20 public sgaToken;
    SGRToken public sgrToken;
    ISGAToSGRInitializerSGAMonetaryModelState public sgaMonetaryModelState;
    MonetaryModelState public sgrMonetaryModelState;

    address  public sgaToSGRTokenExchangeAddress;

    /**
     * @dev Create the contract.
     * @param _redButtonAddress The red button contract address.
     * @param _sgaTokenAddress The SGA token contract address.
     * @param _sgrTokenAddress The SGR token contract address.
     * @param _sgaMonetaryModelStateAddress The SGA MonetaryModelState contract address.
     * @param _sgrMonetaryModelStateAddress The SGR MonetaryModelState contract address.
     * @param _sgaToSGRTokenExchangeAddress The SGA to SGR token exchange contract address.
     */
    constructor(address _redButtonAddress, address _sgaTokenAddress, address _sgrTokenAddress, address _sgaMonetaryModelStateAddress, address _sgrMonetaryModelStateAddress, address _sgaToSGRTokenExchangeAddress) public {
        require(_redButtonAddress != address(0), "red button address is illegal");
        require(_sgaTokenAddress != address(0), "SGA token address is illegal");
        require(_sgrTokenAddress != address(0), "SGR token address is illegal");
        require(_sgaMonetaryModelStateAddress != address(0), "SGA MonetaryModelState address is illegal");
        require(_sgrMonetaryModelStateAddress != address(0), "SGR MonetaryModelState address is illegal");
        require(_sgaToSGRTokenExchangeAddress != address(0), "SGA to SGR token exchange is illegal");

        redButton = IRedButton(_redButtonAddress);
        sgaToken = IERC20(_sgaTokenAddress);
        sgrToken = SGRToken(_sgrTokenAddress);
        sgaMonetaryModelState = ISGAToSGRInitializerSGAMonetaryModelState(_sgaMonetaryModelStateAddress);
        sgrMonetaryModelState = MonetaryModelState(_sgrMonetaryModelStateAddress);
        sgaToSGRTokenExchangeAddress = _sgaToSGRTokenExchangeAddress;
    }

    /**
     * @dev Reverts if called when the red button is not enabled.
     */
    modifier onlyIfRedButtonIsEnabled() {
        require(redButton.isEnabled(), "red button must be enabled");
        _;
    }

    /**
     * @dev Execute initialization methods.
       red button must be enabled for initialization.
     */
    function executeInitialization() external onlyIfRedButtonIsEnabled onlyOwner {
        uint256 initializationSGRAmount = getInitializationAmount();
        sgrToken.init(sgaToSGRTokenExchangeAddress, initializationSGRAmount);
        sgrMonetaryModelState.init(initializationSGRAmount, initializationSGRAmount);
    }

    /**
     * @dev Return final SGA total supply.
       used as initial SGR total supply.
     */
    function getInitializationAmount() public view returns (uint256) {
        uint256 sga1 = sgaToken.totalSupply();
        uint256 sga2 = sgaMonetaryModelState.getSgaTotal();
        require(sga1 == sga2, "abnormal SGA token state");
        uint256 sdr = sgaMonetaryModelState.getSdrTotal();
        require(sga2 == sdr, "abnormal SGA monetary model state");
        return sga1;
    }
}
