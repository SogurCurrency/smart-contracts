class ContractAddressLocator:
    def __init__(self):
        self.registry = {}

    def set(self, _identifier, _contractAddress):
        self.registry[_identifier] = _contractAddress

    def get(self, _identifier):
        return self.registry[_identifier]
