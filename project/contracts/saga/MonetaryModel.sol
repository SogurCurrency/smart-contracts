pragma solidity 0.4.25;

import "./interfaces/IMonetaryModel.sol";
import "./interfaces/IMonetaryModelState.sol";
import "./interfaces/IModelCalculator.sol";
import "./interfaces/IPriceBandCalculator.sol";
import "./interfaces/IIntervalIterator.sol";
import "../contract_address_locator/ContractAddressLocatorHolder.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * Details of usage of licenced software see here: https://www.saga.org/software/readme_v1
 */

/**
 * @title Monetary Model.
 */
contract MonetaryModel is IMonetaryModel, ContractAddressLocatorHolder {
    string public constant VERSION = "1.0.0";

    using SafeMath for uint256;

    event MonetaryModelBuyCompleted(uint256 _input, uint256 _output);
    event MonetaryModelSellCompleted(uint256 _input, uint256 _output);

    /**
     * @dev Create the contract.
     * @param _contractAddressLocator The contract address locator.
     */
    constructor(IContractAddressLocator _contractAddressLocator) ContractAddressLocatorHolder(_contractAddressLocator) public {}

    /**
     * @dev Return the contract which implements the IMonetaryModelState interface.
     */
    function getMonetaryModelState() public view returns (IMonetaryModelState) {
        return IMonetaryModelState(getContractAddress(_IMonetaryModelState_));
    }

    /**
     * @dev Return the contract which implements the IModelCalculator interface.
     */
    function getModelCalculator() public view returns (IModelCalculator) {
        return IModelCalculator(getContractAddress(_IModelCalculator_));
    }

    /**
     * @dev Return the contract which implements the IPriceBandCalculator interface.
     */
    function getPriceBandCalculator() public view returns (IPriceBandCalculator) {
        return IPriceBandCalculator(getContractAddress(_IPriceBandCalculator_));
    }

    /**
     * @dev Return the contract which implements the IIntervalIterator interface.
     */
    function getIntervalIterator() public view returns (IIntervalIterator) {
        return IIntervalIterator(getContractAddress(_IIntervalIterator_));
    }

    /**
     * @dev Buy SGA in exchange for SDR.
     * @param _sdrAmount The amount of SDR received from the buyer.
     * @return The amount of SGA that the buyer is entitled to receive.
     */
    function buy(uint256 _sdrAmount) external only(_ITransactionManager_) returns (uint256) {
        IMonetaryModelState monetaryModelState = getMonetaryModelState();
        IIntervalIterator intervalIterator = getIntervalIterator();

        uint256 sgaTotal = monetaryModelState.getSgaTotal();
        (uint256 alpha, uint256 beta) = intervalIterator.getCurrentIntervalCoefs();
        uint256 sdrAmountAfterFee = getPriceBandCalculator().buy(_sdrAmount, sgaTotal, alpha, beta);
        uint256 sgaAmount = buyFunc(sdrAmountAfterFee, monetaryModelState, intervalIterator);

        emit MonetaryModelBuyCompleted(_sdrAmount, sgaAmount);
        return sgaAmount;
    }

    /**
     * @dev Sell SGA in exchange for SDR.
     * @param _sgaAmount The amount of SGA received from the seller.
     * @return The amount of SDR that the seller is entitled to receive.
     */
    function sell(uint256 _sgaAmount) external only(_ITransactionManager_) returns (uint256) {
        IMonetaryModelState monetaryModelState = getMonetaryModelState();
        IIntervalIterator intervalIterator = getIntervalIterator();

        uint256 sgaTotal = monetaryModelState.getSgaTotal();
        (uint256 alpha, uint256 beta) = intervalIterator.getCurrentIntervalCoefs();
        uint256 sdrAmountBeforeFee = sellFunc(_sgaAmount, monetaryModelState, intervalIterator);
        uint256 sdrAmount = getPriceBandCalculator().sell(sdrAmountBeforeFee, sgaTotal, alpha, beta);

        emit MonetaryModelSellCompleted(_sgaAmount, sdrAmount);
        return sdrAmount;
    }

    /**
     * @dev Execute the SDR-to-SGA algorithm.
     * @param _sdrAmount The amount of SDR.
     * @return The equivalent amount of SGA.
     * @notice The two additional parameters can also be retrieved inside the function.
     * @notice They are passed from the outside, however, in order to improve performance and reduce the cost.
     * @notice Another parameter is retrieved inside the function due to a technical limitation, namely, insufficient stack size.
     */
    function buyFunc(uint256 _sdrAmount, IMonetaryModelState _monetaryModelState, IIntervalIterator _intervalIterator) private returns (uint256) {
        uint256 sgaCount = 0;
        uint256 sdrCount = _sdrAmount;

        uint256 sdrDelta;
        uint256 sgaDelta;

        uint256 sdrTotal = _monetaryModelState.getSdrTotal();
        uint256 sgaTotal = _monetaryModelState.getSgaTotal();

        //Gas consumption is capped, since according to the parameters of the Saga monetary model the execution of more than one iteration of this loop involves transaction of tens (or more) of millions of SDR worth of ETH and are thus unlikely.
        (uint256 minN, uint256 maxN, uint256 minR, uint256 maxR, uint256 alpha, uint256 beta) = _intervalIterator.getCurrentInterval();
        while (sdrCount >= maxR.sub(sdrTotal)) {
            sdrDelta = maxR.sub(sdrTotal);
            sgaDelta = maxN.sub(sgaTotal);
            _intervalIterator.grow();
            (minN, maxN, minR, maxR, alpha, beta) = _intervalIterator.getCurrentInterval();
            sdrTotal = minR;
            sgaTotal = minN;
            sdrCount = sdrCount.sub(sdrDelta);
            sgaCount = sgaCount.add(sgaDelta);
        }

        if (sdrCount > 0) {
            if (getModelCalculator().isTrivialInterval(alpha, beta))
                sgaDelta = getModelCalculator().getValN(sdrCount, maxN, maxR);
            else
                sgaDelta = getModelCalculator().getNewN(sdrTotal.add(sdrCount), minR, minN, alpha, beta).sub(sgaTotal);
            sdrTotal = sdrTotal.add(sdrCount);
            sgaTotal = sgaTotal.add(sgaDelta);
            sgaCount = sgaCount.add(sgaDelta);
        }

        _monetaryModelState.setSdrTotal(sdrTotal);
        _monetaryModelState.setSgaTotal(sgaTotal);

        return sgaCount;
    }

    /**
     * @dev Execute the SGA-to-SDR algorithm.
     * @param _sgaAmount The amount of SGA.
     * @return The equivalent amount of SDR.
     * @notice The two additional parameters can also be retrieved inside the function.
     * @notice They are passed from the outside, however, in order to improve performance and reduce the cost.
     * @notice Another parameter is retrieved inside the function due to a technical limitation, namely, insufficient stack size.
     */
    function sellFunc(uint256 _sgaAmount, IMonetaryModelState _monetaryModelState, IIntervalIterator _intervalIterator) private returns (uint256) {
        uint256 sdrCount = 0;
        uint256 sgaCount = _sgaAmount;

        uint256 sgaDelta;
        uint256 sdrDelta;

        uint256 sgaTotal = _monetaryModelState.getSgaTotal();
        uint256 sdrTotal = _monetaryModelState.getSdrTotal();

        //Gas consumption is capped, since according to the parameters of the Saga monetary model the execution of more than one iteration of this loop involves transaction of tens (or more) of millions of SDR worth of ETH and are thus unlikely.
        (uint256 minN, uint256 maxN, uint256 minR, uint256 maxR, uint256 alpha, uint256 beta) = _intervalIterator.getCurrentInterval();
        while (sgaCount > sgaTotal.sub(minN)) {
            sgaDelta = sgaTotal.sub(minN);
            sdrDelta = sdrTotal.sub(minR);
            _intervalIterator.shrink();
            (minN, maxN, minR, maxR, alpha, beta) = _intervalIterator.getCurrentInterval();
            sgaTotal = maxN;
            sdrTotal = maxR;
            sgaCount = sgaCount.sub(sgaDelta);
            sdrCount = sdrCount.add(sdrDelta);
        }

        if (sgaCount > 0) {
            if (getModelCalculator().isTrivialInterval(alpha, beta))
                sdrDelta = getModelCalculator().getValR(sgaCount, maxR, maxN);
            else
                sdrDelta = sdrTotal.sub(getModelCalculator().getNewR(sgaTotal.sub(sgaCount), minN, minR, alpha, beta));
            sgaTotal = sgaTotal.sub(sgaCount);
            sdrTotal = sdrTotal.sub(sdrDelta);
            sdrCount = sdrCount.add(sdrDelta);
        }

        _monetaryModelState.setSgaTotal(sgaTotal);
        _monetaryModelState.setSdrTotal(sdrTotal);

        return sdrCount;
    }
}
