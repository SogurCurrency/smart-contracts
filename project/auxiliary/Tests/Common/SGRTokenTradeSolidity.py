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
            sgrToken = init(logger,command['timeout'])
        elif command['operation'] == 'buy':
            Contract.jump(command['elapsed'])
            ethAmount = dec2wei(command['amount'])
            sgrAmount = Contract.decode(sgrToken.setter({'value':ethAmount}).exchange(),2,eventParams)['output']
            logger.debug('buy: {:.2f} ETH ==> {:.2f} SGR'.format(wei2dec(ethAmount),wei2dec(sgrAmount)))
        elif command['operation'] == 'sell':
            Contract.jump(command['elapsed'])
            sgrAmount = dec2wei(command['amount'])
            ethAmount = Contract.decode(sgrToken.setter().transfer(sgrToken.address,sgrAmount),2,eventParams)['output']
            logger.debug('sell: {:.2f} SGR ==> {:.2f} ETH'.format(wei2dec(sgrAmount),wei2dec(ethAmount)))
        elif command['operation'] == 'info':
            logger.debug('ETH = {:.2f}'.format(wei2dec(sgrToken.balance())))
            logger.debug('SGR = {:.2f}'.format(wei2dec(sgrToken.getter().totalSupply())))
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
    sgrToken                    = Contract('SGRToken'                   ,[contractAddressLocatorProxy.address        ])
    authorizationDataSource     = Contract('AuthorizationDataSource'    ,[                                           ])
    sgrAuthorizationManager     = Contract('SGRAuthorizationManager'    ,[contractAddressLocatorProxy.address        ])
    buyWalletsTradingDataSource              = Contract('WalletsTradingDataSource'             ,[contractAddressLocatorProxy.address        ])
    sellWalletsTradingDataSource              = Contract('WalletsTradingDataSource'             ,[contractAddressLocatorProxy.address        ])
    walletsTradingLimiterValueConverter                = Contract('WalletsTradingLimiterValueConverter'               ,[                                           ])
    tradingClasses              = Contract('TradingClasses'             ,[                                           ])
    sgrBuyWalletsTradingLimiter              = Contract('SGRBuyWalletsTradingLimiter'             ,[contractAddressLocatorProxy.address        ])
    sgrSellWalletsTradingLimiter              = Contract('SGRSellWalletsTradingLimiter'             ,[contractAddressLocatorProxy.address        ])
    reserveManager              = Contract('ReserveManager'             ,[contractAddressLocatorProxy.address        ])
    paymentManager                 = Contract('PaymentManager'                ,[contractAddressLocatorProxy.address        ])
    paymentQueue                   = Contract('PaymentQueue'                  ,[contractAddressLocatorProxy.address        ])
    redButton                   = Contract('RedButton'                  ,[                                           ])
    sgrTokenManager             = Contract('SGRTokenManager'            ,[contractAddressLocatorProxy.address        ])
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
        ['ISGRToken'               ,sgrToken               .address],
        ['IAuthorizationDataSource',authorizationDataSource.address],
        ['ISGRAuthorizationManager',sgrAuthorizationManager.address],
        ['BuyWalletsTradingDataSource'      ,buyWalletsTradingDataSource      .address],
        ['SellWalletsTradingDataSource'      ,sellWalletsTradingDataSource      .address],
        ['IWalletsTradingLimiterValueConverter'           ,walletsTradingLimiterValueConverter           .address],
        ['ITradingClasses'         ,tradingClasses         .address],
        ["BuyWalletsTLSGRTokenManager"         , sgrBuyWalletsTradingLimiter         .address],
        ["SellWalletsTLSGRTokenManager"         , sgrSellWalletsTradingLimiter         .address],
        ['IReserveManager'         ,reserveManager         .address],
        ['IPaymentManager'            ,paymentManager            .address],
        ['IPaymentQueue'              ,paymentQueue              .address],
        ['IRedButton'              ,redButton              .address],
        ['ISGRTokenManager'        ,sgrTokenManager        .address],
    ]))

    contractAddressLocatorProxy.setter().upgrade(contractAddressLocator.address)

    initialize(modelDataSource.setter(),logger)

    authorizationDataSource.setter().accept(Contract.owner)
    buyWalletsTradingDataSource.setter().setAuthorizedExecutorsIdentifier(["BuyWalletsTLSGRTokenManager"])
    sellWalletsTradingDataSource.setter().setAuthorizedExecutorsIdentifier(["SellWalletsTLSGRTokenManager"])

    authorizationDataSource.setter().upsertOne(Contract.owner,1,True,2**256-1,2**256-1,0)

    return sgrToken
