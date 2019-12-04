import decimal,sys,os
decimal.getcontext().prec = 100
decimal.getcontext().rounding = decimal.ROUND_DOWN
sys.path.append(os.path.dirname(__file__)+'/../Emulation')


import logging
from logging import getLogger
from logging.handlers import SysLogHandler
from logging import StreamHandler,Formatter


DEFAULT_LOG_ADDRESS = ''      # host:port
DEFAULT_LOG_PERIOD  = '1000'  # positive integer
DEFAULT_LOG_LEVEL   = 'DEBUG' # DEBUG/INFO/WARNING/ERROR/CRITICAL


class Logger():
    def __init__(self):
        self.logger   = getLogger('SAGA')
        self.debug    = self.logger.debug
        self.info     = self.logger.info
        self.warning  = self.logger.warning
        self.error    = self.logger.error
        self.critical = self.logger.critical
        self.period   = int(os.getenv('LOG_PERIOD',DEFAULT_LOG_PERIOD))
        level         = getattr(logging,os.getenv('LOG_LEVEL',DEFAULT_LOG_LEVEL).upper())
        address       = os.getenv('LOG_ADDRESS',DEFAULT_LOG_ADDRESS)
        if address:
            host,port = address.split(':')
            file_name = os.path.basename(sys.argv[0])
            log_message = Formatter(file_name+' %(message)s')
            syslogHandler = SysLogHandler(address=(host,int(port)))
            syslogHandler.setFormatter(log_message)
            self.logger.addHandler(syslogHandler)
        streamHandler = StreamHandler(sys.stdout)
        streamHandler.setLevel(level)
        self.logger.addHandler(streamHandler)
        self.logger.setLevel(level)
    def periodic(self,testCount,numOfTests,message):
        func = self.debug if testCount % self.period else self.info
        func('Test {} out of {}: {}'.format(testCount,numOfTests,message))
