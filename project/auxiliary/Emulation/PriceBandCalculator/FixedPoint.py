# Auto-generated via 'AutoGenerate/PriceBandCalculator/PrintConstants.py'
ONE     = 1000000000;
GAMMA   = 165000000000000000000000000000000000000000;
DELTA   = 15000000;


'''
    Denote r = sdrAmount
    Denote n = sgrTotal
    Denote a = alpha / A_B_SCALE
    Denote b = beta  / A_B_SCALE
    Denote c = GAMMA / ONE / A_B_SCALE
    Denote d = DELTA / ONE
    Denote w = c / (a - b * n) - d
    Return r / (1 + w)
'''
def buy(_sdrAmount, _sgrTotal, _alpha, _beta):
    reserveRatio = _alpha - _beta * _sgrTotal;
    variableFix = _sdrAmount * (reserveRatio * ONE) // (reserveRatio * (ONE - DELTA) + GAMMA);
    return variableFix;

'''
    Denote r = sdrAmount
    Denote n = sgrTotal
    Denote a = alpha / A_B_SCALE
    Denote b = beta  / A_B_SCALE
    Denote c = GAMMA / ONE / A_B_SCALE
    Denote d = DELTA / ONE
    Denote w = c / (a - b * n) - d
    Return r * (1 - w)
'''
def sell(_sdrAmount, _sgrTotal, _alpha, _beta):
    reserveRatio = _alpha - _beta * _sgrTotal;
    variableFix = _sdrAmount * (reserveRatio * (ONE + DELTA) - GAMMA) // (reserveRatio * ONE);
    return variableFix;
