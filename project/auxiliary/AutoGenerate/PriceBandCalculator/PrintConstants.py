from fractions import Fraction


import sys
sys.path.append('../../Tests')
from Common.ModelDataSource import intervalLists

A_B = intervalLists[ 0][0][4]

minW = Fraction('0.0015')
maxW = Fraction('0.1500')
minR = Fraction('0.5800')
maxR = Fraction('0.1000')


factor = (maxW-minW)/(1/maxR-1/minR)
offset = factor/minR-minW
limitB = 1/(1+minW)
limitS = 1-minW


ONE     = 10**9
GAMMA   = int(factor*ONE*A_B)
DELTA   = int(offset*ONE)


print('    uint256 public constant ONE     = {};'.format(ONE    ))
print('    uint256 public constant GAMMA   = {};'.format(GAMMA  ))
print('    uint256 public constant DELTA   = {};'.format(DELTA  ))
