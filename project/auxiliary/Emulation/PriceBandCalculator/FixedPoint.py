# Auto-generated via 'AutoGenerate/PriceBandCalculator/PrintConstants.py'
ONE     = 1000000000;
MIN_RR  = 1000000000000000000000000000000000;
MAX_RR  = 10000000000000000000000000000000000;
GAMMA   = 179437500000000000000000000000000000000000;
DELTA   = 29437500;
BUY_N   = 2000;
BUY_D   = 2003;
SELL_N  = 1997;
SELL_D  = 2000;
MAX_SDR = 500786938745138896681892746900;

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
    reserveRatio = _alpha - _beta * _sgaTotal;
    assert(MIN_RR <= reserveRatio and reserveRatio <= MAX_RR);
    variableFix = _sdrAmount * (reserveRatio * ONE) // (reserveRatio * (ONE - DELTA) + GAMMA);
    constantFix = _sdrAmount * BUY_N // BUY_D;
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
    reserveRatio = _alpha - _beta * _sgaTotal;
    assert(MIN_RR <= reserveRatio and reserveRatio <= MAX_RR);
    variableFix = _sdrAmount * (reserveRatio * (ONE + DELTA) - GAMMA) // (reserveRatio * ONE);
    constantFix = _sdrAmount * SELL_N // SELL_D;
    return min(constantFix, variableFix);
