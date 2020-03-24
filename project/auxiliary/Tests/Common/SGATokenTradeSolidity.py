from Common.Blockchain import Web3
from Common.Blockchain import Contract
from Common.ModelDataSource import initialize
from Common.Utils.CommandReader import load
from Common.Utils.UnitConverter import dec2wei
from Common.Utils.UnitConverter import wei2dec


eventParams = [
    {'name':'user'  ,'size':160,'indexed':True },
    {'name':'input' ,'size':256,'indexed':False},
    {'name':'output','size':256,'indexed':False},
]


def unzip(tuples):
    return [Web3.toHex(text=tuple[0]) for tuple in tuples],[tuple[1] for tuple in tuples]


def run(fileName,logger):
    logger.info('Executing sequence...')
    for command in load(fileName):
        if command['operation'] == 'init':
            sgaToken = init(logger,command['timeout'])
        elif command['operation'] == 'buy':
            Contract.jump(command['elapsed'])
            ethAmount = dec2wei(command['amount'])
            sgaAmount = Contract.decode(sgaToken.setter({'value':ethAmount}).exchange(),2,eventParams)['output']
            logger.debug('buy: {:.2f} ETH ==> {:.2f} SGA'.format(wei2dec(ethAmount),wei2dec(sgaAmount)))
        elif command['operation'] == 'sell':
            Contract.jump(command['elapsed'])
            sgaAmount = dec2wei(command['amount'])
            ethAmount = Contract.decode(sgaToken.setter().transfer(sgaToken.address,sgaAmount),2,eventParams)['output']
            logger.debug('sell: {:.2f} SGA ==> {:.2f} ETH'.format(wei2dec(sgaAmount),wei2dec(ethAmount)))
        elif command['operation'] == 'info':
            logger.debug('ETH = {:.2f}'.format(wei2dec(sgaToken.balance())))
            logger.debug('SGA = {:.2f}'.format(wei2dec(sgaToken.getter().totalSupply())))
        else:
            logger.debug('Undefined operation')
    logger.info('Done')


def init(logger,timeout):
    contractAddressLocatorProxy = Contract('ContractAddressLocatorProxy',[                                           ])
    modelCalculator             = Contract('ModelCalculator'            ,[                                           ])
    priceBandCalculator            = Contract('PriceBandCalculator'           ,[                                           ])
    reconciliationAdjuster           = Contract('ReconciliationAdjuster'          ,[                                           ])
    ethConverter        = Contract('ETHConverter'       ,[contractAddressLocatorProxy.address        ])
    modelDataSource                  = Contract('ModelDataSource'                 ,[                                           ])
    mintingPointTimersManager                 = Contract('MintingPointTimersManager'                ,[contractAddressLocatorProxy.address,timeout])
    mintManager                 = Contract('MintManager'                ,[contractAddressLocatorProxy.address        ])
    intervalIterator            = Contract('IntervalIterator'           ,[contractAddressLocatorProxy.address        ])
    monetaryModelState              = Contract('MonetaryModelState'             ,[contractAddressLocatorProxy.address        ])
    monetaryModel                   = Contract('MonetaryModel'                  ,[contractAddressLocatorProxy.address        ])
    transactionLimiter          = Contract('TransactionLimiter'         ,[contractAddressLocatorProxy.address        ])
    transactionManager          = Contract('TransactionManager'         ,[contractAddressLocatorProxy.address        ])
    sgaToken                    = Contract('SGAToken'                   ,[contractAddressLocatorProxy.address        ])
    authorizationDataSource     = Contract('AuthorizationDataSource'    ,[                                           ])
    sgaAuthorizationManager     = Contract('SGAAuthorizationManager'    ,[contractAddressLocatorProxy.address        ])
    buyWalletsTradingDataSource              = Contract('WalletsTradingDataSource'             ,[contractAddressLocatorProxy.address        ])
    sellWalletsTradingDataSource              = Contract('WalletsTradingDataSource'             ,[contractAddressLocatorProxy.address        ])
    walletsTradingLimiterValueConverter                = Contract('WalletsTradingLimiterValueConverter'               ,[                                           ])
    tradingClasses              = Contract('TradingClasses'             ,[                                           ])
    sgaBuyWalletsTradingLimiter              = Contract('SGABuyWalletsTradingLimiter'             ,[contractAddressLocatorProxy.address        ])
    sgaSellWalletsTradingLimiter              = Contract('SGASellWalletsTradingLimiter'             ,[contractAddressLocatorProxy.address        ])
    reserveManager              = Contract('ReserveManager'             ,[contractAddressLocatorProxy.address        ])
    paymentManager                 = Contract('PaymentManager'                ,[contractAddressLocatorProxy.address        ])
    paymentQueue                   = Contract('PaymentQueue'                  ,[contractAddressLocatorProxy.address        ])
    redButton                   = Contract('RedButton'                  ,[                                           ])
    sgaTokenManager             = Contract('SGATokenManager'            ,[contractAddressLocatorProxy.address        ])
    contractAddressLocator      = Contract('ContractAddressLocator'     ,unzip([
        ['IModelCalculator'        ,modelCalculator        .address],
        ['IPriceBandCalculator'       ,priceBandCalculator       .address],
        ['IReconciliationAdjuster'      ,reconciliationAdjuster      .address],
        ['IETHConverter'   ,ethConverter   .address],
        ['IModelDataSource'             ,modelDataSource             .address],
        ['IMintingPointTimersManager'            ,mintingPointTimersManager            .address],
        ['IMintManager'            ,mintManager            .address],
        ['IIntervalIterator'       ,intervalIterator       .address],
        ['IMonetaryModelState'         ,monetaryModelState         .address],
        ['IMonetaryModel'              ,monetaryModel              .address],
        ['ITransactionLimiter'     ,transactionLimiter     .address],
        ['ITransactionManager'     ,transactionManager     .address],
        ['ISGAToken'               ,sgaToken               .address],
        ['IAuthorizationDataSource',authorizationDataSource.address],
        ['ISGAAuthorizationManager',sgaAuthorizationManager.address],
        ['BuyWalletsTradingDataSource'      ,buyWalletsTradingDataSource      .address],
        ['SellWalletsTradingDataSource'      ,sellWalletsTradingDataSource      .address],
        ['IWalletsTradingLimiterValueConverter'           ,walletsTradingLimiterValueConverter           .address],
        ['ITradingClasses'         ,tradingClasses         .address],
        ["BuyWalletsTLSGATokenManager"         , sgaBuyWalletsTradingLimiter         .address],
        ["SellWalletsTLSGATokenManager"         , sgaSellWalletsTradingLimiter         .address],
        ['IReserveManager'         ,reserveManager         .address],
        ['IPaymentManager'            ,paymentManager            .address],
        ['IPaymentQueue'              ,paymentQueue              .address],
        ['IRedButton'              ,redButton              .address],
        ['ISGATokenManager'        ,sgaTokenManager        .address],
    ]))

    contractAddressLocatorProxy.setter().upgrade(contractAddressLocator.address)

    initialize(modelDataSource.setter(),logger)

    authorizationDataSource.setter().accept(Contract.owner)
    buyWalletsTradingDataSource.setter().setAuthorizedExecutorsIdentifier(["BuyWalletsTLSGATokenManager"])
    sellWalletsTradingDataSource.setter().setAuthorizedExecutorsIdentifier(["SellWalletsTLSGATokenManager"])

    authorizationDataSource.setter().upsertOne(Contract.owner,1,True,2**256-1,2**256-1,0)

    return sgaToken
