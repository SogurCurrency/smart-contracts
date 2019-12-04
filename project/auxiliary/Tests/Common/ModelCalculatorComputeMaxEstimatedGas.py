from ModelCalculator import FixedPoint
from Common.Blockchain import Contract
from Common.ModelDataSource import intervalLists


def run(numOfTestsPerInterval,logger,conversionHandler,distributionFunc):
    intervals  = [[minN,maxN,minR,maxR,alpha,beta] for minN,maxN,minR,maxR,alpha,beta in sum(intervalLists,[])]
    numOfTests = numOfTestsPerInterval*len(intervals)
    testCount  = 0

    maxGas = 0
    module = conversionHandler(Contract('ModelCalculator').tester())

    logger.info('Starting {} tests...'.format(numOfTests))
    for minN,maxN,minR,maxR,alpha,beta in intervals:
        module.SetIntervalTypeExternally(FixedPoint,alpha,beta)
        minV,maxV = conversionHandler.inputRange(minN,maxN,minR,maxR)
        for newV in distributionFunc(minV,maxV,numOfTestsPerInterval):
            testCount += 1
            curGas = module.outputFunc(newV,minN,maxN,minR,maxR,alpha,beta)
            maxGas = max(maxGas,curGas)
            logger.periodic(testCount,numOfTests,'curGas = {}, maxGas = {}'.format(curGas,maxGas))
    logger.info('Done:  maxGas = {}'.format(maxGas))
