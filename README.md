# Saga's Smart Contracts

This repository contains the code used in Saga's system of smart contracts.
For more information, visit our website: https://www.saga.org/


Saga's smart contract system is based on two ERC-20 tokens:
1. SGAToken: Saga's main token - the Saga currency.
2. SGNToken: Saga's stakeholder remuneration token - represent the right to receive up to 15 SGAs per 1 SGN.

In addition to these ERC-20 based smart contracts, the smart contract system includes other contracts needed to support SGA's and SGN's functionality.

## SGA Token

In addition to its ERC-20 (i.e. transferability) utility, the SGA token serves as its own market-maker, i.e mints new SGA tokens upon receiving of ETH and pays back ETH when SGA tokens are burned.

To support the zero-time execution of SGA's market-making operations, the smart contract system must:
1. Calculate SGA/ETH price according to Saga's monetary model.
2. Enforces Saga's KYC/AML policy, limiting the ability to transact using SGA and SGN tokens to pre-approved addresses.

#### ETH to SGA exchange
The exchange of ETH to SGA is done by calling the public payable `exchange()` function. Assuming the sending address is allowed to buy SGA, all ETH sent is exchanged to SGA and sent back to the sender's address.

The contract's fallback function can also be used with the exact same functionality.

#### SGA to ETH exchange
The exchange of SGA to ETH is done by calling the `transfer(to, value)` function, with the contract's address as the `to` paramter.  

## SGN Token

In addition to its ERC-20 (i.e. transferability) utility, the SGN token can be converted to SGA tokens according to Saga's monetary model.

The conversion is done by either:
  1. calling the `convert(value)` function, with `value` the amount of SGN tokens (in wei) to be converted.
  2. calling the `transfer(to, value)` function, with the contract's address as `to` and the amount to be converted as `value`.
