# Dividend Bearing Token (DIV)

## Common Attacks Avoided

### 1. Integer Overflow and Underflow
All mathematical operations in the contract use the SafeMath.sol library, to avoid any possibility of Integer Overflow and Underflow
	
### 2. DoS with Block Gas Limit

If every time a payment was made to the contract, the contract iterated through an array of token holders and sent them all their designated ETH, an attacker could add a bunch of addresses, each of which needs to get a very small amounts of divideds, and we would quickly hit the gas limit. Instead, users can collect their dividends when updateAccount(address) is called, either by calling "claim()" or when tokens are transferred to or from a user. This is the "pull" method of receiving payments, rather than the "push" method.

### 3. Reentrancy

In the "updateAccount" modifier, I made sure to update all internal state, updating the lastDividends of the account before sending the account any Ether. If the order of those two lines were switched, a user could call claim() multiple times and receive their dividends more than once. 

### 4. Force Sending Ether

Attackers force sending Ether could cause confusion amongst token holders, so the contract internally tracks its balance with the variable: totalDividends.
