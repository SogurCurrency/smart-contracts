from constants import *
from functions import log
from decimal import Decimal
from decimal import getcontext
from collections import namedtuple


getcontext().prec = 100
FIXED_ONE = 2**PRECISION


HiTerm = namedtuple('HiTerm','val,exp')
LoTerm = namedtuple('LoTerm','num,den')


hiTerms = []
loTerms = []


for n in range(LOG_NUM_OF_HI_TERMS+1):
    cur = Decimal(LOG_MAX_HI_TERM_VAL)/2**n
    val = int(FIXED_ONE*cur)
    exp = int(FIXED_ONE*cur.exp())
    hiTerms.append(HiTerm(val,exp))


MAX_VAL = hiTerms[0].exp-1
loTerms = [LoTerm(FIXED_ONE*2,FIXED_ONE*2)]
res = log(MAX_VAL,hiTerms,loTerms,FIXED_ONE)
while True:
    n = len(loTerms)
    val = FIXED_ONE*(2*n+2)
    loTermsNext = loTerms+[LoTerm(val//(2*n+1),val)]
    resNext = log(MAX_VAL,hiTerms,loTermsNext,FIXED_ONE)
    if res < resNext:
        res = resNext
        loTerms = loTermsNext
    else:
        break


hiTermValMaxLen = len(hex(hiTerms[+1].val))
hiTermExpMaxLen = len(hex(hiTerms[+1].exp))
loTermNumMaxLen = len(hex(loTerms[ 0].num))
loTermDenMaxLen = len(hex(loTerms[-1].den))


hiTermIndMaxLen = len(str(len(hiTerms)*1-1))
loTermPosMaxLen = len(str(len(loTerms)*2-1))
loTermNegMaxLen = len(str(len(loTerms)*2-0))


print('        assert(_x < 0x{:x}); // ensure that the input is smaller than e^{:d}'.format(hiTerms[0].exp,LOG_MAX_HI_TERM_VAL))
for n in range(1,len(hiTerms)):
    str1 = '{0:#0{1}x}'.format(hiTerms[n].exp,hiTermExpMaxLen)
    str2 = '{0:#0{1}x}'.format(hiTerms[n].val,hiTermValMaxLen)
    str3 = '{0:0{1}d}' .format(n             ,hiTermIndMaxLen)
    print('        if (_x >= {}) {{res += {}; _x = _x * FIXED_ONE / {};}} // add {} / 2^{}'.format(str1,str2,str1,LOG_MAX_HI_TERM_VAL,str3))
print('')
print('        assert(_x >= FIXED_ONE);')
print('        z = y = _x - FIXED_ONE;')
print('        w = y * y / FIXED_ONE;')
for n in range(len(loTerms)-1):
    str1 = '{0:#0{1}x}'.format(loTerms[n].num,loTermNumMaxLen)
    str2 = '{0:#0{1}x}'.format(loTerms[n].den,loTermDenMaxLen)
    str3 = '{0:0{1}d}' .format(2*n+1         ,loTermPosMaxLen)
    str4 = '{0:0{1}d}' .format(2*n+2         ,loTermNegMaxLen)
    print('        res += z * ({} - y) / {}; z = z * w / FIXED_ONE; // add y^{} / {} - y^{} / {}'.format(str1,str2,str3,str3,str4,str4))
for n in range(len(loTerms)-1,len(loTerms)):
    str1 = '{0:#0{1}x}'.format(loTerms[n].num,loTermNumMaxLen)
    str2 = '{0:#0{1}x}'.format(loTerms[n].den,loTermDenMaxLen)
    str3 = '{0:0{1}d}' .format(2*n+1         ,loTermPosMaxLen)
    str4 = '{0:0{1}d}' .format(2*n+2         ,loTermNegMaxLen)
    print('        res += z * ({} - y) / {};                        // add y^{} / {} - y^{} / {}'.format(str1,str2,str3,str3,str4,str4))
