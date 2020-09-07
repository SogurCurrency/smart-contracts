from constants import PRECISION


import sys
sys.path.append('../../Tests')
from Common.ModelDataSource import intervalLists


FIXED_ONE = 2**PRECISION
A_B_SCALE = intervalLists[0][0][4]


print('    uint256 public constant FIXED_ONE = {};'.format(hex(FIXED_ONE)))
print('    uint256 public constant A_B_SCALE = {};'.format(str(A_B_SCALE)))
