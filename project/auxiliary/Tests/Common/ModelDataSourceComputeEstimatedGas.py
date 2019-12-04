from Common.Blockchain import Contract
from Common.ModelDataSource import intervalLists


def run(logger):
    module = Contract('ModelDataSource')

    setter = module.setter()
    getter = module.getter()
    tester = module.tester()

    mLen = len(str(len(intervalLists)))
    nLen = max([len(str(len(intervalList))) for intervalList in intervalLists])

    totalGas = 0
    logger.info('Setting intervals...')
    for m in range(len(intervalLists)):
        for n in range(len(intervalLists[m])):
            gas = tester.setInterval(m,n,*intervalLists[m][n])
            setter.setInterval(m,n,*intervalLists[m][n])
            assert getter.getInterval(m,n) == intervalLists[m][n]
            logger.debug('Set interval {0:{1}} {2:{3}}: gas = {4}'.format(m,mLen,n,nLen,gas))
            totalGas += gas
    logger.info('Total gas = {}'.format(totalGas))

    setter.lock()
    try:
        setter.setInterval(0,0,*intervalLists[0][0])
        logger.error('Lock failure')
    except ValueError:
        logger.info('Lock success')
