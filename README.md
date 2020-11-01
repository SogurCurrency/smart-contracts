# Sögur's Smart Contracts

This repository contains the code used in Sögur's system of smart contracts.
For more information, visit our website: https://www.sogur.com/


Sögur's smart contract system is based on two ERC-20 tokens:
1. SGrToken: Sögur's main token - the Sögur currency.
2. SGNToken: Sögur's stakeholder remuneration token - represent the right to receive up to 15 SGRs per 1 SGN.

In addition to these ERC-20 based smart contracts, the smart contract system includes other contracts needed to support SGR's and SGN's functionality.

## SGR Token

In addition to its ERC-20 (i.e. transferability) utility, the SGR token serves as its own market-maker, i.e mints new SGR tokens upon receiving of ETH and pays back ETH when SGR tokens are burned.

To support the zero-time execution of SGR's market-making operations, the smart contract system must:
1. Calculate SGR/ETH price according to Sögur's monetary model.
2. Enforces Saga's KYC/AML policy, limiting the ability to transact using SGR and SGN tokens to pre-approved addresses.

#### ETH to SGR exchange
The exchange of ETH to SGR is done by calling the public payable `exchange()` function. Assuming the sending address is allowed to buy SGR, all ETH sent is exchanged to SGR and sent back to the sender's address.

The contract's fallback function can also be used with the exact same functionality.

#### SGR to ETH exchange
The exchange of SGR to ETH is done by calling the `transfer(to, value)` function, with the contract's address as the `to` paramter.  

## SGN Token

In addition to its ERC-20 (i.e. transferability) utility, the SGN token can be converted to SGR tokens according to Sögur's monetary model.

The conversion is done by either:
  1. calling the `convert(value)` function, with `value` the amount of SGN tokens (in wei) to be converted.
  2. calling the `transfer(to, value)` function, with the contract's address as `to` and the amount to be converted as `value`.


###### *Special thanks to [barakman](https://github.com/barakman) for his contribution*
