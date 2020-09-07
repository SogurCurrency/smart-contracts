class MintingPointTimersManager():
    class Timestamp():
        def __init__(self, _valid, _value):
            self.valid = _valid;
            self.value = _value;

    def __init__(self, _contractAddressLocator, _timeout):
        self.contractAddressLocator = _contractAddressLocator;
        self.now = 1;
        self.timeout = _timeout;
        self.timestamps = [MintingPointTimersManager.Timestamp(False, 0) for r in range(95)];

    def start(self, _id):
        timestamp = self.timestamps[_id];
        assert(not timestamp.valid);
        timestamp.valid = True;
        timestamp.value = self.time();

    def reset(self, _id):
        timestamp = self.timestamps[_id];
        assert(timestamp.valid);
        timestamp.valid = False;
        timestamp.value = 0;

    def running(self, _id):
        timestamp = self.timestamps[_id];
        if (not timestamp.valid):
            return False;
        return timestamp.value + self.timeout >= self.time();

    def expired(self, _id):
        timestamp = self.timestamps[_id];
        if (not timestamp.valid):
            return False;
        return timestamp.value + self.timeout < self.time();

    def time(self):
        return self.now;
