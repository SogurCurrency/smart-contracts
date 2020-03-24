from Common.Blockchain import Web3
from Common.Blockchain import Contract
from Common.ModelDataSource import initialize


CONSTANTS = [(2**16)**n for n in range(0,5)]
MAX_SDR_AMOUNT = 500786938745138896681892746900


eventParams = [
    {'name':'user'  ,'size':160,'indexed':True },
    {'name':'input' ,'size':256,'indexed':False},
    {'name':'output','size':256,'indexed':False},
]


def unzip(tuples):
    return [Web3.toHex(text=tuple[0]) for tuple in tuples],[tuple[1] for tuple in tuples]


def run(logger):
    contractAddressLocatorProxy = Contract('ContractAddressLocatorProxy',[                                   ])
    modelCalculator             = Contract('ModelCalculator'            ,[                                   ])
    priceBandCalculator            = Contract('PriceBandCalculator'           ,[                                   ])
    reconciliationAdjuster           = Contract('ReconciliationAdjuster'          ,[                                   ])
    ethConverter        = Contract('ETHConverter'       ,[contractAddressLocatorProxy.address])
    rateApprover        = Contract('RateApprover'       ,[contractAddressLocatorProxy.address])
    modelDataSource                  = Contract('ModelDataSource'                 ,[                                   ])
    monetaryModel                   = Contract('MonetaryModel'                  ,[contractAddressLocatorProxy.address])
    transactionLimiter          = Contract('TransactionLimiter'         ,[contractAddressLocatorProxy.address])
    transactionManager          = Contract('TransactionManager'         ,[contractAddressLocatorProxy.address])
    authorizationDataSource     = Contract('AuthorizationDataSource'    ,[                                   ])
    sgaAuthorizationManager     = Contract('SGAAuthorizationManager'    ,[contractAddressLocatorProxy.address])
    buyWalletsTradingDataSource              = Contract('WalletsTradingDataSource'             ,[contractAddressLocatorProxy.address        ])
    sellWalletsTradingDataSource              = Contract('WalletsTradingDataSource'             ,[contractAddressLocatorProxy.address        ])
    sgaBuyWalletsTradingLimiter              = Contract('SGABuyWalletsTradingLimiter'             ,[contractAddressLocatorProxy.address        ])
    sgaSellWalletsTradingLimiter              = Contract('SGASellWalletsTradingLimiter'             ,[contractAddressLocatorProxy.address        ])
    walletsTradingLimiterValueConverter            = Contract('WalletsTradingLimiterValueConverter'           ,[                                   ])
    tradingClasses              = Contract('TradingClasses'             ,[                                   ])

    reserveManager              = Contract('ReserveManager'             ,[contractAddressLocatorProxy.address])
    paymentManager                 = Contract('PaymentManager'                ,[contractAddressLocatorProxy.address])
    paymentQueue                   = Contract('PaymentQueue'                  ,[contractAddressLocatorProxy.address])
    redButton                   = Contract('RedButton'                  ,[                                   ])
    sgaTokenManager             = Contract('SGATokenManager'            ,[contractAddressLocatorProxy.address])

    initialize(modelDataSource.setter(),logger)

    walletsTradingLimiterValueConverter.setter().accept(Contract.owner)
    ethConverter.setter().accept(Contract.owner)
    authorizationDataSource.setter().accept(Contract.owner)
    buyWalletsTradingDataSource.setter().setAuthorizedExecutorsIdentifier( [Web3.toHex(text='BuyWalletsTLSGATokenManager'), Web3.toHex(text='WalletsTLSGNTokenManager')])
    sellWalletsTradingDataSource.setter().setAuthorizedExecutorsIdentifier( [Web3.toHex(text='SellWalletsTLSGATokenManager')])

    authorizationDataSource.setter().upsertOne(Contract.owner,1,True,2**256-1,2**256-1,2**256-1,0)

    testCount  = 0
    numOfTests = len(CONSTANTS)**4
    logger.info('Starting {} tests...'.format(numOfTests))

    for factorN in CONSTANTS:
        for factorD in CONSTANTS:
            for priceN in CONSTANTS:
                for priceD in CONSTANTS:
                    testCount += 1
                    mintingPointTimersManager            = Contract('MintingPointTimersManager'           ,[contractAddressLocatorProxy.address,2**255])
                    mintManager            = Contract('MintManager'           ,[contractAddressLocatorProxy.address       ])
                    intervalIterator       = Contract('IntervalIterator'      ,[contractAddressLocatorProxy.address       ])
                    monetaryModelState         = Contract('MonetaryModelState'        ,[contractAddressLocatorProxy.address       ])
                    sgaToken               = Contract('SGAToken'              ,[contractAddressLocatorProxy.address       ])
                    contractAddressLocator = Contract('ContractAddressLocator',unzip([
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
                        ['IWalletsTLValueConverter'       ,walletsTradingLimiterValueConverter       .address],
                        ['ITradingClasses'         ,tradingClasses         .address],
                        ["BuyWalletsTLSGATokenManager"         , sgaBuyWalletsTradingLimiter         .address],
                        ["SellWalletsTLSGATokenManager"         , sgaSellWalletsTradingLimiter         .address],
                        ['BuyWalletsTradingDataSource'      ,buyWalletsTradingDataSource      .address],
                        ['SellWalletsTradingDataSource'      ,sellWalletsTradingDataSource      .address],
                        ['IReserveManager'         ,reserveManager         .address],
                        ['IPaymentManager'            ,paymentManager            .address],
                        ['IPaymentQueue'              ,paymentQueue              .address],
                        ['IRedButton'              ,redButton              .address],
                        ['ISGATokenManager'        ,sgaTokenManager        .address],
                        ["IRateApprover"           , rateApprover               .address],
                    ]))
                    contractAddressLocatorProxy.setter().upgrade(contractAddressLocator.address)
                    rateApprover.setter().setRateBounds(1, 0x10000000000000000,1,1,0x10000000000000000)
                    walletsTradingLimiterValueConverter.setter().setPrice(testCount,1,1)

                    reconciliationAdjuster.setter().setFactor(testCount,factorN,factorD)
                    ethConverter.setter().setPrice(testCount,priceN,priceD,priceN,priceD)
                    sdrInput     = reconciliationAdjuster.getter().adjustSell(MAX_SDR_AMOUNT)
                    ethInput     = ethConverter.getter().toEthAmount(sdrInput)
                    b_sgaOutput  = Contract.decode(sgaToken.setter({'value':ethInput}).exchange(),2,eventParams)['output']
                    b_sdrInModel = monetaryModelState.getter().getSdrTotal()
                    b_sgaInModel = monetaryModelState.getter().getSgaTotal()
                    b_sgaInToken = sgaToken.getter().totalSupply()
                    b_ethInToken = sgaToken.balance()
                    s_ethOutput  = Contract.decode(sgaToken.setter().transfer(sgaToken.address,b_sgaOutput),2,eventParams)['output']
                    s_sdrInModel = monetaryModelState.getter().getSdrTotal()
                    s_sgaInModel = monetaryModelState.getter().getSgaTotal()
                    s_sgaInToken = sgaToken.getter().totalSupply()
                    s_ethInToken = sgaToken.balance()
                    logger.periodic(testCount,numOfTests,'factorN      = {}'.format(int(factorN     )))
                    logger.periodic(testCount,numOfTests,'factorD      = {}'.format(int(factorD     )))
                    logger.periodic(testCount,numOfTests,'priceN       = {}'.format(int(priceN      )))
                    logger.periodic(testCount,numOfTests,'priceD       = {}'.format(int(priceD      )))
                    logger.periodic(testCount,numOfTests,'sdrInput     = {}'.format(int(sdrInput    )))
                    logger.periodic(testCount,numOfTests,'ethInput     = {}'.format(int(ethInput    )))
                    logger.periodic(testCount,numOfTests,'b_sgaOutput  = {}'.format(int(b_sgaOutput )))
                    logger.periodic(testCount,numOfTests,'b_sdrInModel = {}'.format(int(b_sdrInModel)))
                    logger.periodic(testCount,numOfTests,'b_sgaInModel = {}'.format(int(b_sgaInModel)))
                    logger.periodic(testCount,numOfTests,'b_sgaInToken = {}'.format(int(b_sgaInToken)))
                    logger.periodic(testCount,numOfTests,'b_ethInToken = {}'.format(int(b_ethInToken)))
                    logger.periodic(testCount,numOfTests,'s_ethOutput  = {}'.format(int(s_ethOutput )))
                    logger.periodic(testCount,numOfTests,'s_sdrInModel = {}'.format(int(s_sdrInModel)))
                    logger.periodic(testCount,numOfTests,'s_sgaInModel = {}'.format(int(s_sgaInModel)))
                    logger.periodic(testCount,numOfTests,'s_sgaInToken = {}'.format(int(s_sgaInToken)))
                    logger.periodic(testCount,numOfTests,'s_ethInToken = {}'.format(int(s_ethInToken)))
