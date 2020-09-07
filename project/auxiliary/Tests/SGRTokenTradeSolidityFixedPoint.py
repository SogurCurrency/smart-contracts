import Config


from Common.Utils.UserInput import read
from Common.SGRTokenTradeSolidity import run


run(read(default='TradeInputExample.json'),Config.Logger())