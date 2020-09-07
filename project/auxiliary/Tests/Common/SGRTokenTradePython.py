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
from Common.Utils.CommandReader import load
from Common.Utils.UnitConverter import dec2wei
from Common.Utils.UnitConverter import wei2dec


def run(fileName,logger,modelCalculator,priceBandCalculator,ReconciliationAdjuster,ETHConverter):
    logger.info('Executing sequence...')
    for command in load(fileName):
        if command['operation'] == 'init':
            mintingPointTimersManager,sgrToken = init(logger,modelCalculator,priceBandCalculator,ReconciliationAdjuster,ETHConverter,command['timeout'])
        elif command['operation'] == 'buy':
            mintingPointTimersManager.now += command['elapsed']
            ethAmount = dec2wei(command['amount'])
            sgrAmount = sgrToken.buy(ethAmount)
            logger.debug('buy: {:.2f} ETH ==> {:.2f} SGR'.format(wei2dec(ethAmount),wei2dec(sgrAmount)))
        elif command['operation'] == 'sell':
            mintingPointTimersManager.now += command['elapsed']
            sgrAmount = dec2wei(command['amount'])
            ethAmount = sgrToken.sell(sgrAmount)
            logger.debug('sell: {:.2f} SGR ==> {:.2f} ETH'.format(wei2dec(sgrAmount),wei2dec(ethAmount)))
        elif command['operation'] == 'info':
            logger.debug('ETH = {:.2f}'.format(wei2dec(sgrToken.ethTotal)))
            logger.debug('SGR = {:.2f}'.format(wei2dec(sgrToken.sgrTotal)))
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
    sgrToken               = SGRToken              (contractAddressLocator)

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
    contractAddressLocator.set('SGRToken'            ,sgrToken            )

    initialize(modelDataSource,logger)

    return mintingPointTimersManager,sgrToken
