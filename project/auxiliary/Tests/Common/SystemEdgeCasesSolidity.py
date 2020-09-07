from Common.Blockchain import Web3
from Common.Blockchain import Contract
from Common.ModelDataSource import initialize


CONSTANTS = [(2**16)**n for n in range(0,5)]
MAX_SDR_AMOUNT = 500028600499998013465789011863


eventParams = [
    {'name':'user'  ,'size':160,'indexed':True },
    {'name':'input' ,'size':256,'indexed':False},
    {'name':'output','size':256,'indexed':False},
]


def unzip(tuples):
    return [Web3.toHex(text=tuple[0]) for tuple in tuples],[tuple[1] for tuple in tuples]


def run(logger):
    contractAddressLocatorProxy = Contract('ContractAddressLocatorProxy',[                                   ])
    aggregatorInterfaceMockup              = Contract('AggregatorInterfaceMockup'             ,[                                   ])
    modelCalculator             = Contract('ModelCalculator'            ,[                                   ])
    priceBandCalculator            = Contract('PriceBandCalculator'           ,[                                   ])
    reconciliationAdjuster           = Contract('ReconciliationAdjuster'          ,[                                   ])
    ethConverter        = Contract('ETHConverter'       ,[contractAddressLocatorProxy.address])
    rateApprover        = Contract('OracleRateApprover'       ,[contractAddressLocatorProxy.address, aggregatorInterfaceMockup.address, 10000])
    modelDataSource                  = Contract('ModelDataSource'                 ,[                                   ])
    monetaryModel                   = Contract('MonetaryModel'                  ,[contractAddressLocatorProxy.address])
    transactionLimiter          = Contract('TransactionLimiter'         ,[contractAddressLocatorProxy.address])
    transactionManager          = Contract('TransactionManager'         ,[contractAddressLocatorProxy.address])
    authorizationDataSource     = Contract('AuthorizationDataSource'    ,[                                   ])
    sgrAuthorizationManager     = Contract('SGRAuthorizationManager'    ,[contractAddressLocatorProxy.address])
    buyWalletsTradingDataSource              = Contract('WalletsTradingDataSource'             ,[contractAddressLocatorProxy.address        ])
    sellWalletsTradingDataSource              = Contract('WalletsTradingDataSource'             ,[contractAddressLocatorProxy.address        ])
    sgrBuyWalletsTradingLimiter              = Contract('SGRBuyWalletsTradingLimiter'             ,[contractAddressLocatorProxy.address        ])
    sgrSellWalletsTradingLimiter              = Contract('SGRSellWalletsTradingLimiter'             ,[contractAddressLocatorProxy.address        ])
    walletsTradingLimiterValueConverter            = Contract('WalletsTradingLimiterValueConverter'           ,[                                   ])
    tradingClasses              = Contract('TradingClasses'             ,[                                   ])

    reserveManager              = Contract('ReserveManager'             ,[contractAddressLocatorProxy.address])
    paymentManager                 = Contract('PaymentManager'                ,[contractAddressLocatorProxy.address])
    paymentQueue                   = Contract('PaymentQueue'                  ,[contractAddressLocatorProxy.address])
    redButton                   = Contract('RedButton'                  ,[                                   ])
    sgrTokenManager             = Contract('SGRTokenManager'            ,[contractAddressLocatorProxy.address])

    initialize(modelDataSource.setter(),logger)

    walletsTradingLimiterValueConverter.setter().accept(Contract.owner)
    ethConverter.setter().accept(Contract.owner)
    authorizationDataSource.setter().accept(Contract.owner)
    buyWalletsTradingDataSource.setter().setAuthorizedExecutorsIdentifier( [Web3.toHex(text='BuyWalletsTLSGRTokenManager'), Web3.toHex(text='WalletsTLSGNTokenManager')])
    sellWalletsTradingDataSource.setter().setAuthorizedExecutorsIdentifier( [Web3.toHex(text='SellWalletsTLSGRTokenManager')])

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
                    sgrToken               = Contract('SGRToken'              ,[contractAddressLocatorProxy.address       ])
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
                        ['ISGRToken'               ,sgrToken               .address],
                        ['IAuthorizationDataSource',authorizationDataSource.address],
                        ['ISGRAuthorizationManager',sgrAuthorizationManager.address],
                        ['IWalletsTLValueConverter'       ,walletsTradingLimiterValueConverter       .address],
                        ['ITradingClasses'         ,tradingClasses         .address],
                        ["BuyWalletsTLSGRTokenManager"         , sgrBuyWalletsTradingLimiter         .address],
                        ["SellWalletsTLSGRTokenManager"         , sgrSellWalletsTradingLimiter         .address],
                        ['BuyWalletsTradingDataSource'      ,buyWalletsTradingDataSource      .address],
                        ['SellWalletsTradingDataSource'      ,sellWalletsTradingDataSource      .address],
                        ['IReserveManager'         ,reserveManager         .address],
                        ['IPaymentManager'            ,paymentManager            .address],
                        ['IPaymentQueue'              ,paymentQueue              .address],
                        ['IRedButton'              ,redButton              .address],
                        ['ISGRTokenManager'        ,sgrTokenManager        .address],
                        ["IRateApprover"           , rateApprover               .address],
                    ]))

                    price = int((priceN/priceD)*100000000)
                    tooLowPrice = price == 0

                    try :
                        contractAddressLocatorProxy.setter().upgrade(contractAddressLocator.address)

                        aggregatorInterfaceMockup.setter().setLatestAnswer(price)

                        walletsTradingLimiterValueConverter.setter().setPrice(testCount,1,1)

                        reconciliationAdjuster.setter().setFactor(testCount,factorN,factorD)
                        ethConverter.setter().setPrice(testCount,priceN,priceD,priceN,priceD)
                        sdrInput     = reconciliationAdjuster.getter().adjustSell(MAX_SDR_AMOUNT)
                        ethInput     = ethConverter.getter().toEthAmount(sdrInput)
                        b_sgrOutput  = Contract.decode(sgrToken.setter({'value':ethInput}).exchange(),2,eventParams)['output']
                        b_sdrInModel = monetaryModelState.getter().getSdrTotal()
                        b_sgrInModel = monetaryModelState.getter().getSgrTotal()
                        b_sgrInToken = sgrToken.getter().totalSupply()
                        b_ethInToken = sgrToken.balance()
                        s_ethOutput  = Contract.decode(sgrToken.setter().transfer(sgrToken.address,b_sgrOutput),2,eventParams)['output']
                        s_sdrInModel = monetaryModelState.getter().getSdrTotal()
                        s_sgrInModel = monetaryModelState.getter().getSgrTotal()
                        s_sgrInToken = sgrToken.getter().totalSupply()
                        s_ethInToken = sgrToken.balance()
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

                    except Exception as e:
                        if(tooLowPrice):
                            logger.periodic(testCount,numOfTests,'tooLowPrice priceN {} priceD {} price {}'.format(priceN, priceD, price))
                        else:
                            raise e

