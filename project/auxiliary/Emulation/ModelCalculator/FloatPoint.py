from decimal import Decimal
from ModelCalculator.FixedPoint import A_B_SCALE

'''
    Denote a = alpha / A_B_SCALE
    Denote b = beta  / A_B_SCALE
    Return true if and only if a = 1 and b = 0
'''
def isTrivialInterval(_alpha, _beta):
    return _alpha == A_B_SCALE and _beta == 0;

'''
    Denote x = valR
    Denote y = maxN
    Denote z = maxR
    Return x * y / z
'''
def getValN(_valR, _maxN, _maxR):
    _valR, _maxN, _maxR = [Decimal(val) for val in (_valR, _maxN, _maxR)]
    return _valR * _maxN / _maxR;

'''
    Denote x = valN
    Denote y = maxR
    Denote z = maxN
    Return x * y / z
'''
def getValR(_valN, _maxR, _maxN):
    _valN, _maxR, _maxN = [Decimal(val) for val in (_valN, _maxR, _maxN)]
    return _valN * _maxR / _maxN;

'''
    Denote x = newR
    Denote y = minR
    Denote z = minN
    Denote a = alpha / A_B_SCALE
    Denote b = beta  / A_B_SCALE
    Return a * (x / y) ^ a / (a / z + b * ((x / y) ^ a - 1))
'''
def getNewN(_newR, _minR, _minN, _alpha, _beta):
    _newR, _minR, _minN, _alpha, _beta = [Decimal(val) for val in (_newR, _minR, _minN, _alpha, _beta)]
    temp = (_newR / _minR) ** (_alpha / A_B_SCALE);
    return _alpha * temp / (_alpha / _minN + _beta * (temp - 1));

'''
    Denote x = newN
    Denote y = minN
    Denote z = minR
    Denote a = alpha / A_B_SCALE
    Denote b = beta  / A_B_SCALE
    Return ((a - b * y) * x / (a - b * x) * y) ^ (1 / a) * z
'''
def getNewR(_newN, _minN, _minR, _alpha, _beta):
    _newN, _minN, _minR, _alpha, _beta = [Decimal(val) for val in (_newN, _minN, _minR, _alpha, _beta)]
    temp1 = _alpha - _beta * _minN;
    temp2 = _alpha - _beta * _newN;
    return (temp1 / temp2 * _newN / _minN) ** (A_B_SCALE / _alpha) * _minR;
