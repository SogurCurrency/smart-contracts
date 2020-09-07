from ContractAddressLocator import ContractAddressLocator
from ModelDataSource             import ModelDataSource
from MintingPointTimersManager            import MintingPointTimersManager
from MintManager            import MintManager           
from IntervalIterator       import IntervalIterator      
from MonetaryModelState         import MonetaryModelState
from MonetaryModel              import MonetaryModel
from TransactionLimiter     import TransactionLimiter    
from TransactionManager     import TransactionManager    
from SGRToken               import SGRToken              


from Common.ModelDataSource import initialize


CONSTANTS = [(2**16)**n for n in range(0,5)]
MAX_SDR_AMOUNT = 500028600499998013465789011863


def run(logger,modelCalculator,priceBandCalculator,ReconciliationAdjuster,ETHConverter):
    contractAddressLocator = ContractAddressLocator()
    reconciliationAdjuster      = ReconciliationAdjuster     ()
    ethConverter   = ETHConverter  (contractAddressLocator)
    modelDataSource             = ModelDataSource            ()
    monetaryModel              = MonetaryModel             (contractAddressLocator)
    transactionLimiter     = TransactionLimiter    (contractAddressLocator)
    transactionManager     = TransactionManager    (contractAddressLocator)

    contractAddressLocator.set('ModelCalculator'     ,modelCalculator     )
    contractAddressLocator.set('PriceBandCalculator'    ,priceBandCalculator    )
    contractAddressLocator.set('ReconciliationAdjuster'   ,reconciliationAdjuster   )
    contractAddressLocator.set('ETHConverter',ethConverter)
    contractAddressLocator.set('ModelDataSource'     ,modelDataSource          )
    contractAddressLocator.set('MonetaryModel'           ,monetaryModel           )
    contractAddressLocator.set('TransactionLimiter'  ,transactionLimiter  )
    contractAddressLocator.set('TransactionManager'  ,transactionManager  )

    initialize(modelDataSource,logger)

    testCount  = 0
    numOfTests = len(CONSTANTS)**4
    logger.info('Starting {} tests...'.format(numOfTests))

    for factorN in CONSTANTS:
        for factorD in CONSTANTS:
            for priceN in CONSTANTS:
                for priceD in CONSTANTS:
                    testCount += 1
                    mintingPointTimersManager      = MintingPointTimersManager     (contractAddressLocator,2**255)
                    mintManager      = MintManager     (contractAddressLocator)
                    intervalIterator = IntervalIterator(contractAddressLocator)
                    monetaryModelState   = MonetaryModelState  (contractAddressLocator)
                    sgrToken         = SGRToken        (contractAddressLocator)
                    contractAddressLocator.set('MintingPointTimersManager'     ,mintingPointTimersManager     )
                    contractAddressLocator.set('MintManager'     ,mintManager     )
                    contractAddressLocator.set('IntervalIterator',intervalIterator)
                    contractAddressLocator.set('MonetaryModelState'  ,monetaryModelState  )
                    contractAddressLocator.set('SGRToken'        ,sgrToken        )
                    reconciliationAdjuster.setFactor(testCount,factorN,factorD)
                    ethConverter.setPrice(testCount,priceN,priceD,priceN,priceD)
                    sdrInput     = reconciliationAdjuster.adjustSell(MAX_SDR_AMOUNT)
                    ethInput     = ethConverter.toEthAmount(sdrInput)
                    b_sgrOutput  = sgrToken.buy(ethInput)
                    b_sdrInModel = monetaryModelState.getSdrTotal()
                    b_sgrInModel = monetaryModelState.getSgrTotal()
                    b_sgrInToken = sgrToken.sgrTotal
                    b_ethInToken = sgrToken.ethTotal
                    s_ethOutput  = sgrToken.sell(b_sgrOutput)
                    s_sdrInModel = monetaryModelState.getSdrTotal()
                    s_sgrInModel = monetaryModelState.getSgrTotal()
                    s_sgrInToken = sgrToken.sgrTotal
                    s_ethInToken = sgrToken.ethTotal
                    logger.periodic(testCount,numOfTests,'factorN      = {}'.format(int(factorN     )))
                    logger.periodic(testCount,numOfTests,'factorD      = {}'.format(int(factorD     )))
                    logger.periodic(testCount,numOfTests,'priceN       = {}'.format(int(priceN      )))
                    logger.periodic(testCount,numOfTests,'priceD       = {}'.format(int(priceD      )))
                    logger.periodic(testCount,numOfTests,'sdrInput     = {}'.format(int(sdrInput    )))
                    logger.periodic(testCount,numOfTests,'ethInput     = {}'.format(int(ethInput    )))
                    logger.periodic(testCount,numOfTests,'b_sgrOutput  = {}'.format(int(b_sgrOutput )))
                    logger.periodic(testCount,numOfTests,'b_sdrInModel = {}'.format(int(b_sdrInModel)))
                    logger.periodic(testCount,numOfTests,'b_sgrInModel = {}'.format(int(b_sgrInModel)))
                    logger.periodic(testCount,numOfTests,'b_sgrInToken = {}'.format(int(b_sgrInToken)))
                    logger.periodic(testCount,numOfTests,'b_ethInToken = {}'.format(int(b_ethInToken)))
                    logger.periodic(testCount,numOfTests,'s_ethOutput  = {}'.format(int(s_ethOutput )))
                    logger.periodic(testCount,numOfTests,'s_sdrInModel = {}'.format(int(s_sdrInModel)))
                    logger.periodic(testCount,numOfTests,'s_sgrInModel = {}'.format(int(s_sgrInModel)))
                    logger.periodic(testCount,numOfTests,'s_sgrInToken = {}'.format(int(s_sgrInToken)))
                    logger.periodic(testCount,numOfTests,'s_ethInToken = {}'.format(int(s_ethInToken)))
