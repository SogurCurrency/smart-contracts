from ModelCalculator import FixedPoint
from ModelCalculator import FloatPoint
from Common.ModelDataSource import intervalLists


def run(numOfTestsPerInterval,logger,conversionHandler,distributionFunc):
    intervals  = [[minN,maxN,minR,maxR,alpha,beta] for minN,maxN,minR,maxR,alpha,beta in sum(intervalLists,[])]
    numOfTests = numOfTestsPerInterval*len(intervals)
    testCount  = 0

    module1 = conversionHandler(FixedPoint)
    module2 = conversionHandler(FloatPoint)

    minRatio = float('+inf')
    maxRatio = float('-inf')

    logger.info('Starting {} tests...'.format(numOfTests))
    for minN,maxN,minR,maxR,alpha,beta in intervals:
        module1.SetIntervalTypeInternally(alpha,beta)
        module2.SetIntervalTypeInternally(alpha,beta)
        minV,maxV = conversionHandler.inputRange(minN,maxN,minR,maxR)
        for newV in distributionFunc(minV,maxV,numOfTestsPerInterval):
            testCount += 1
            output1 = module1.outputFunc(newV,minN,maxN,minR,maxR,alpha,beta)
            output2 = module2.outputFunc(newV,minN,maxN,minR,maxR,alpha,beta)
            curRatio = output1/output2 if output1 != output2 else 1
            minRatio = min(minRatio,curRatio)
            maxRatio = max(maxRatio,curRatio)
            logger.periodic(testCount,numOfTests,'minRatio = {:.40f}, maxRatio = {:.40f}'.format(minRatio,maxRatio))
    logger.info('Done: minRatio = {:.40f}, maxRatio = {:.40f}'.format(minRatio,maxRatio))
