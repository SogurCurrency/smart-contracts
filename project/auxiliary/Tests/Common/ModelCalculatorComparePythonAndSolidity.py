from ModelCalculator import FixedPoint
from Common.Blockchain import Contract
from Common.ModelDataSource import intervalLists


def run(numOfTestsPerInterval,logger,conversionHandler,distributionFunc):
    intervals  = [[minN,maxN,minR,maxR,alpha,beta] for minN,maxN,minR,maxR,alpha,beta in sum(intervalLists,[])]
    numOfTests = numOfTestsPerInterval*len(intervals)
    testCount  = 0

    module1 = conversionHandler(FixedPoint)
    module2 = conversionHandler(Contract('ModelCalculator').getter())

    logger.info('Starting {} tests...'.format(numOfTests))
    for minN,maxN,minR,maxR,alpha,beta in intervals:
        module1.SetIntervalTypeInternally(alpha,beta)
        module2.SetIntervalTypeInternally(alpha,beta)
        minV,maxV = conversionHandler.inputRange(minN,maxN,minR,maxR)
        for newV in distributionFunc(minV,maxV,numOfTestsPerInterval):
            testCount += 1
            output1 = module1.outputFunc(newV,minN,maxN,minR,maxR,alpha,beta)
            output2 = module2.outputFunc(newV,minN,maxN,minR,maxR,alpha,beta)
            logger.periodic(testCount,numOfTests,'python = {}, solidity = {}'.format(output1,output2))
            if output1 != output2:
                logger.error('Emulation error:')
                logger.error('minN  = {}'.format(minN ))
                logger.error('maxN  = {}'.format(maxN ))
                logger.error('minR  = {}'.format(minR ))
                logger.error('maxR  = {}'.format(maxR ))
                logger.error('alpha = {}'.format(alpha))
                logger.error('beta  = {}'.format(beta ))
                logger.error('newV  = {}'.format(newV ))
                return
    logger.info('Done')
