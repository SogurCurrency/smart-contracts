from decimal import Decimal as dec
from ModelCalculator import FixedPoint


def run(resolution,logger):
    MIN_BASE =  1
    MAX_BASE = 20
    MIN_EXPO =  0
    MAX_EXPO =  8

    aRange,b = range(resolution*MIN_BASE,resolution*MAX_BASE),resolution
    cRange,d = range(resolution*MIN_EXPO,resolution*MAX_EXPO),resolution

    minRatio   = 1
    testCount  = 0
    numOfTests = len(aRange)*len(cRange)

    logger.info('Starting {} tests...'.format(numOfTests))
    for a in aRange:
        for c in cRange:
            try:
                testCount += 1
                output1 = FixedPoint.pow(FixedPoint.FIXED_ONE*a,b,c,d)
                output2 = FixedPoint.FIXED_ONE*(dec(a)/dec(b))**(dec(c)/dec(d))
                curRatio = output1/output2 if output1 != output2 else 1
                minRatio = min(minRatio,curRatio)
                logger.periodic(testCount,numOfTests,'curRatio = {:.40f}, minRatio = {:.40f}'.format(curRatio,minRatio))
                if output1 > output2:
                    logger.error('Emulation error:')
                    logger.error('a = {}'.format(a))
                    logger.error('b = {}'.format(b))
                    logger.error('c = {}'.format(c))
                    logger.error('d = {}'.format(d))
                    return
            except AssertionError:
                logger.periodic(testCount,numOfTests,'curRatio = {:.40f}, minRatio = {:.40f} (illegal input)'.format(0,minRatio))
    logger.info('Done: minRatio = {:.40f}'.format(minRatio))
