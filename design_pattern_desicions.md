# Dividend Bearing Token (DIV)

## Design Pattern Decisions

### 1. Pull over Push Payments
One of the main design decisions I made was for dividend payments from the contract to be "pulled" by token holders rather than be "pushed" by the contract. If every time a payment was made to the contract, the contract iterated through an array of token holders and sent them all their designated ETH, we would quickly hit the gas limit (vulnerable to DOS gas limit attack). Instead, users can call "claim()" to collect their dividends. 
	
### 2. Fail early and fail loud

This design pattern was implemented in "sendFunds", throwing an error if a user calls "sendFunds" with a msg.value of 0 wei.

### 3. Circuit Breaker

I implemented a circuit breaker, by extending the PausableToken.sol contract. When the owner of the token contract calls "pause()", no tokens can be transferred, and no dividends can be claimed until the contract is unpaused.
