from constants import denomination
from constants import mintedTokens


from math import gcd
from fractions import Fraction


import sys
sys.path.append('../../Tests')
from Common.ModelDataSource import intervalLists


oneToken = 10**denomination
maxAmount = sum(mintedTokens.values())


num = 0
den = 0
lcm = 1


ratios = []
for n in range(len(intervalLists)-1):
    if n in mintedTokens:
        den += mintedTokens[n]*oneToken
    ratio = Fraction(num,den)
    lcm *= ratio.denominator//gcd(lcm,ratio.denominator)
    ratios.append(ratio)
    num += intervalLists[n+1][0][0]-intervalLists[n+0][0][1]
ratio = Fraction(num,den)
lcm *= ratio.denominator//gcd(lcm,ratio.denominator)
ratios.append(ratio)


def factorize(n,p):
    c = 0
    while n%p == 0:
        n /= p
        c += 1
    return c


c2 = factorize(lcm,2)
c5 = factorize(lcm,5)
if lcm == 2**c2*5**c5:
    lcm = 10**max(c2,c5)


numerators = [ratio.numerator*lcm//ratio.denominator for ratio in ratios]
assert den*numerators[-1] < 2**256
len1 = len(str(len(numerators)))
len2 = len(str(max(numerators)))


print('    uint256 public constant MAX_AMOUNT = {}e{};\n'.format(maxAmount,denomination))
print('    uint256 public constant DENOMINATOR = {};\n'.format(lcm))
print('    uint256[{}] public numerators;\n'.format(len(numerators)))
print('    constructor() public {')
for n in range(len(numerators)):
    print('        numerators[{0:{1}d}] = {2:{3}d};'.format(n,len1,numerators[n],len2))
print('    }')
