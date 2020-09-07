from decimal import Decimal


def dec2wei(num): return int(Decimal(num)*Decimal(10**18))
def wei2dec(num): return Decimal(int(num))/Decimal(10**18)
