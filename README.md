# Dividend Bearing Token (DIV)

DIV is a Dividend Bearing ERC20 Token. What this means is that DIV can receive funds in ETH and token holders can collect dividends based on the percentage of DIV tokens they hold. For example, DIV tokens could represent an apartment, where rent earned from that apartment is paid in ETH to the DIV contract. If I own 10% of all of the apartment's DIV tokens, I can collect 10% of the rent money that was paid to the contract. Thanks for trying it out!!
## Installation

1. Install Truffle globally.

    ```
    npm install -g truffle
    ```

2. Install Ganache-CLI globally.

    ```
    npm install -g ganache-cli

    ```

3. Compile and migrate the smart contracts.  
    
	```
    truffle compile
    ```
    
    ```
    truffle migrate
    ```

4. Run your private blockchain.
 
    ```
    ganache-cli
    ```

5. Run the webpack server for front-end hot reloading (outside the development console). Smart contract changes must be manually recompiled and migrated. You can now view the web app at http://localhost:3000
 
    ```
    npm run start
    ```

6. To run tests:
 
    ```
    truffle test
    ```


## FAQ

* __How do I reset the demo?__

    To reset the DIV token supply, the ETH in the DIV contract, and the amount of DIV you hold, run:
    
    ```
    truffle migrate --reset
    npm run start
    ```    
    
    
## Explanation of Tests
The main contract that I implemented can be found at 
    ``` 
/contracts/token/ERC20/DividendToken.sol
    ``` 
    
and my tests for this contract can be found at 
    ``` 
/tests/token/ERC20/DividendToken.test.js
    ``` 
    
The "total supply" and "balanceOf" tests are simply to ensure that the "beforeEach" function worked successfully and that there are 100 DIV tokens, with half going to "owner" and half going to "recipient".

The "transfer" tests token transfers and ensures that both accounts end up with the correct amount of DIV. 

The "accepting payments" tests make sure the contract can accept payments in ETH, but reject payments of 0 wei.

The "distribute dividends" ensures that users receive the correct amount of ETH when they claim their dividends (e.g. if they have 10% of total tokens, they receive 10% of the ETH in the contract), and that dividends are distributed for both sender and receiver before any "transfer" or "transferFrom". This is to prevent an attack where someone could try to collect their dividends and then send their DIV tokens to another account who could then collect extra dividends.
