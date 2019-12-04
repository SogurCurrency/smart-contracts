from fractions import Fraction


import sys
sys.path.append('../../Tests')
from Common.ModelDataSource import intervalLists


A_B = intervalLists[ 0][0][4]
SDR = intervalLists[-1][0][3]


minRR = Fraction('0.1')
maxRR = Fraction('1.0')


minW = Fraction('0.0015')
maxW = Fraction('0.1500')
minR = Fraction('0.5800')
maxR = Fraction('0.1000')


factor = (maxW-minW)/(1/maxR-1/minR)
offset = factor/minR-minW
limitB = 1/(1+minW)
limitS = 1-minW


ONE     = 10**9
MIN_RR  = int(minRR*A_B)
MAX_RR  = int(maxRR*A_B)
GAMMA   = int(factor*ONE*A_B)
DELTA   = int(offset*ONE)
BUY_N   = limitB.numerator
BUY_D   = limitB.denominator
SELL_N  = limitS.numerator
SELL_D  = limitS.denominator
MAX_SDR = SDR * BUY_D // BUY_N


print('    uint256 public constant ONE     = {};'.format(ONE    ))
print('    uint256 public constant MIN_RR  = {};'.format(MIN_RR ))
print('    uint256 public constant MAX_RR  = {};'.format(MAX_RR ))
print('    uint256 public constant GAMMA   = {};'.format(GAMMA  ))
print('    uint256 public constant DELTA   = {};'.format(DELTA  ))
print('    uint256 public constant BUY_N   = {};'.format(BUY_N  ))
print('    uint256 public constant BUY_D   = {};'.format(BUY_D  ))
print('    uint256 public constant SELL_N  = {};'.format(SELL_N ))
print('    uint256 public constant SELL_D  = {};'.format(SELL_D ))
print('    uint256 public constant MAX_SDR = {};'.format(MAX_SDR))
