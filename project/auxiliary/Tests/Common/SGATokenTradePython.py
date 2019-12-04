from ContractAddressLocator import ContractAddressLocator
from ModelDataSource             import ModelDataSource
from MintingPointTimersManager            import MintingPointTimersManager
from MintManager            import MintManager           
from IntervalIterator       import IntervalIterator      
from MonetaryModelState         import MonetaryModelState
from MonetaryModel              import MonetaryModel
from TransactionLimiter     import TransactionLimiter    
from TransactionManager     import TransactionManager    
from SGAToken               import SGAToken              


from Common.ModelDataSource import initialize
from Common.Utils.CommandReader import load
from Common.Utils.UnitConverter import dec2wei
from Common.Utils.UnitConverter import wei2dec


def run(fileName,logger,modelCalculator,priceBandCalculator,ReconciliationAdjuster,ETHConverter):
    logger.info('Executing sequence...')
    for command in load(fileName):
        if command['operation'] == 'init':
            mintingPointTimersManager,sgaToken = init(logger,modelCalculator,priceBandCalculator,ReconciliationAdjuster,ETHConverter,command['timeout'])
        elif command['operation'] == 'buy':
            mintingPointTimersManager.now += command['elapsed']
            ethAmount = dec2wei(command['amount'])
            sgaAmount = sgaToken.buy(ethAmount)
            logger.debug('buy: {:.2f} ETH ==> {:.2f} SGA'.format(wei2dec(ethAmount),wei2dec(sgaAmount)))
        elif command['operation'] == 'sell':
            mintingPointTimersManager.now += command['elapsed']
            sgaAmount = dec2wei(command['amount'])
            ethAmount = sgaToken.sell(sgaAmount)
            logger.debug('sell: {:.2f} SGA ==> {:.2f} ETH'.format(wei2dec(sgaAmount),wei2dec(ethAmount)))
        elif command['operation'] == 'info':
            logger.debug('ETH = {:.2f}'.format(wei2dec(sgaToken.ethTotal)))
            logger.debug('SGA = {:.2f}'.format(wei2dec(sgaToken.sgaTotal)))
        else:
            logger.debug('Undefined operation')
    logger.info('Done')


def init(logger,modelCalculator,priceBandCalculator,ReconciliationAdjuster,ETHConverter,timeout):
    contractAddressLocator = ContractAddressLocator()
    reconciliationAdjuster      = ReconciliationAdjuster     ()
    ethConverter   = ETHConverter  (contractAddressLocator)
    modelDataSource             = ModelDataSource            ()
    mintingPointTimersManager            = MintingPointTimersManager           (contractAddressLocator,timeout)
    mintManager            = MintManager           (contractAddressLocator)
    intervalIterator       = IntervalIterator      (contractAddressLocator)
    monetaryModelState         = MonetaryModelState        (contractAddressLocator)
    monetaryModel              = MonetaryModel             (contractAddressLocator)
    transactionLimiter     = TransactionLimiter    (contractAddressLocator)
    transactionManager     = TransactionManager    (contractAddressLocator)
    sgaToken               = SGAToken              (contractAddressLocator)

    contractAddressLocator.set('ModelCalculator'     ,modelCalculator     )
    contractAddressLocator.set('PriceBandCalculator'    ,priceBandCalculator    )
    contractAddressLocator.set('ReconciliationAdjuster'   ,reconciliationAdjuster   )
    contractAddressLocator.set('ETHConverter',ethConverter)
    contractAddressLocator.set('ModelDataSource'          ,modelDataSource          )
    contractAddressLocator.set('MintingPointTimersManager'         ,mintingPointTimersManager         )
    contractAddressLocator.set('MintManager'         ,mintManager         )
    contractAddressLocator.set('IntervalIterator'    ,intervalIterator    )
    contractAddressLocator.set('MonetaryModelState'      ,monetaryModelState      )
    contractAddressLocator.set('MonetaryModel'           ,monetaryModel           )
    contractAddressLocator.set('TransactionLimiter'  ,transactionLimiter  )
    contractAddressLocator.set('TransactionManager'  ,transactionManager  )
    contractAddressLocator.set('SGAToken'            ,sgaToken            )

    initialize(modelDataSource,logger)

    return mintingPointTimersManager,sgaToken
