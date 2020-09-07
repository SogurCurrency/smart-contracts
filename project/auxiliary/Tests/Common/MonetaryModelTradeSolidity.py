from Common.Blockchain import Web3
from Common.Blockchain import Contract
from Common.ModelDataSource import initialize
from Common.Utils.CommandReader import load
from Common.Utils.UnitConverter import dec2wei
from Common.Utils.UnitConverter import wei2dec


eventParams = [
    {'name':'input' ,'size':256,'indexed':False},
    {'name':'output','size':256,'indexed':False},
]


def unzip(tuples):
    return [Web3.toHex(text=tuple[0]) for tuple in tuples],[tuple[1] for tuple in tuples]


def run(fileName,logger):
    logger.info('Executing sequence...')
    for command in load(fileName):
        if command['operation'] == 'init':
            monetaryModelState,monetaryModel = init(logger,command['timeout'])
        elif command['operation'] == 'buy':
            Contract.jump(command['elapsed'])
            sdrAmount = dec2wei(command['amount'])
            sgrAmount = Contract.decode(monetaryModel.setter().buy(sdrAmount),0,eventParams)['output']
            logger.debug('buy: {:.2f} SDR ==> {:.2f} SGR'.format(wei2dec(sdrAmount),wei2dec(sgrAmount)))
        elif command['operation'] == 'sell':
            Contract.jump(command['elapsed'])
            sgrAmount = dec2wei(command['amount'])
            sdrAmount = Contract.decode(monetaryModel.setter().sell(sgrAmount),0,eventParams)['output']
            logger.debug('sell: {:.2f} SGR ==> {:.2f} SDR'.format(wei2dec(sgrAmount),wei2dec(sdrAmount)))
        elif command['operation'] == 'info':
            logger.debug('SDR = {:.2f}'.format(wei2dec(monetaryModelState.getter().getSdrTotal())))
            logger.debug('SGR = {:.2f}'.format(wei2dec(monetaryModelState.getter().getSgrTotal())))
        else:
            logger.debug('Undefined operation')
    logger.info('Done')


def init(logger,timeout):
    contractAddressLocatorProxy = Contract('ContractAddressLocatorProxy',[                                           ])
    modelCalculator             = Contract('ModelCalculator'            ,[                                           ])
    priceBandCalculator            = Contract('PriceBandCalculator'           ,[                                           ])
    modelDataSource                  = Contract('ModelDataSource'                 ,[                                           ])
    mintingPointTimersManager                 = Contract('MintingPointTimersManager'                ,[contractAddressLocatorProxy.address,timeout])
    mintManager                 = Contract('MintManager'                ,[contractAddressLocatorProxy.address        ])
    intervalIterator            = Contract('IntervalIterator'           ,[contractAddressLocatorProxy.address        ])
    monetaryModelState              = Contract('MonetaryModelState'             ,[contractAddressLocatorProxy.address        ])
    monetaryModel                   = Contract('MonetaryModel'                  ,[contractAddressLocatorProxy.address        ])
    contractAddressLocator      = Contract('ContractAddressLocator'     ,unzip([
        ['IModelCalculator'   ,modelCalculator.address ],
        ['IPriceBandCalculator'  ,priceBandCalculator.address],
        ['IModelDataSource'        ,modelDataSource.address      ],
        ['IMintingPointTimersManager'       ,mintingPointTimersManager.address     ],
        ['IMintManager'       ,mintManager.address     ],
        ['IIntervalIterator'  ,intervalIterator.address],
        ['IMonetaryModelState'    ,monetaryModelState.address  ],
        ['IMonetaryModel'         ,monetaryModel.address       ],
        ['ITransactionManager',Contract.owner          ],
    ]))

    contractAddressLocatorProxy.setter().upgrade(contractAddressLocator.address)

    initialize(modelDataSource.setter(),logger)

    return monetaryModelState,monetaryModel
