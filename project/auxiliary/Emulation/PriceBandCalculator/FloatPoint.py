from decimal import Decimal                    
from PriceBandCalculator.FixedPoint import ONE
from PriceBandCalculator.FixedPoint import MIN_RR
from PriceBandCalculator.FixedPoint import MAX_RR
from PriceBandCalculator.FixedPoint import GAMMA
from PriceBandCalculator.FixedPoint import DELTA
from PriceBandCalculator.FixedPoint import BUY_N
from PriceBandCalculator.FixedPoint import BUY_D
from PriceBandCalculator.FixedPoint import SELL_N
from PriceBandCalculator.FixedPoint import SELL_D
from PriceBandCalculator.FixedPoint import MAX_SDR

'''
    Denote r = sdrAmount
    Denote n = sgaTotal
    Denote a = alpha / A_B_SCALE
    Denote b = beta  / A_B_SCALE
    Denote c = GAMMA / ONE / A_B_SCALE
    Denote d = DELTA / ONE
    Denote w = c / (a - b * n) - d
    Return r / (1 + w)
'''
def buy(_sdrAmount, _sgaTotal, _alpha, _beta):
    assert(_sdrAmount <= MAX_SDR);
    _sdrAmount, _sgaTotal, _alpha, _beta = [Decimal(val) for val in (_sdrAmount, _sgaTotal, _alpha, _beta)]
    reserveRatio = _alpha - _beta * _sgaTotal;
    assert(MIN_RR <= reserveRatio and reserveRatio <= MAX_RR);
    variableFix = _sdrAmount * (reserveRatio * ONE) / (reserveRatio * (ONE - DELTA) + GAMMA);
    constantFix = _sdrAmount * BUY_N / BUY_D;
    return min(constantFix, variableFix);

'''
    Denote r = sdrAmount
    Denote n = sgaTotal
    Denote a = alpha / A_B_SCALE
    Denote b = beta  / A_B_SCALE
    Denote c = GAMMA / ONE / A_B_SCALE
    Denote d = DELTA / ONE
    Denote w = c / (a - b * n) - d
    Return r * (1 - w)
'''
def sell(_sdrAmount, _sgaTotal, _alpha, _beta):
    assert(_sdrAmount <= MAX_SDR);
    _sdrAmount, _sgaTotal, _alpha, _beta = [Decimal(val) for val in (_sdrAmount, _sgaTotal, _alpha, _beta)]
    reserveRatio = _alpha - _beta * _sgaTotal;
    assert(MIN_RR <= reserveRatio and reserveRatio <= MAX_RR);
    variableFix = _sdrAmount * (reserveRatio * (ONE + DELTA) - GAMMA) / (reserveRatio * ONE);
    constantFix = _sdrAmount * SELL_N / SELL_D;
    return min(constantFix, variableFix);
