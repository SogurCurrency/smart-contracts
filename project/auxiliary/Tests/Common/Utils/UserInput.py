from sys import argv


def read(default):
    return type(default)(argv[1]) if len(argv) > 1 else default
