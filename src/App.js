import React, { Component } from 'react'
import DividendTokenContract from '../build/contracts/DividendTokenMock.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ethBalance: 0,
      divBalance: 0,
      totalSupply: 0,
      divEthBalance: 0,
      percentage: 0,
      web3: null,
      contract: null,
      account: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const dividendToken = contract(DividendTokenContract)
    dividendToken.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on dividendToken.
    var dividendTokenInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      dividendToken.deployed().then((instance) => {
        dividendTokenInstance = instance
        return  dividendTokenInstance.balanceOf(accounts[0], {from: accounts[0]})
      }).then((balance) => {
        const that = this
        return this.state.web3.eth.getBalance(accounts[0], function(err, res) {
          return that.setState({ ethBalance: that.state.web3.fromWei(res.toNumber(), 'ether'),
            contract: dividendTokenInstance,
            account: accounts[0],
            divBalance: balance.toNumber()})
        })

      //   // Get the value from the contract to prove it worked.
      //   return dividendTokenInstance.get.call(accounts[0])
      // }).then((result) => {
      //   // Update state with the result.
      //   return this.setState({ storageValue: result.c[0] })
      }).then((result) => {
        return dividendTokenInstance.totalSupply.call()
      }).then((result) => {
        this.setState({ totalSupply: result.toNumber()})
        this.setPercentage()
        const that = this
        return this.state.web3.eth.getBalance(dividendTokenInstance.address, function(err, res) {
          return that.setState({ divEthBalance: that.state.web3.fromWei(res.toNumber(), 'ether') })
        })
      })
    })
  }

  setPercentage() {
    const {divBalance, totalSupply} = this.state
    this.setState({ percentage: divBalance / totalSupply })
  }

  mintUserTokens() {
    const contract = this.state.contract
    const account = this.state.account
    return contract.mint(account, 10, { from: account })
  }

  sendETH() {
    const contract = this.state.contract
    const account = this.state.account
    return contract.sendFunds({ value: this.state.web3.toWei('10', 'ether'), from: account })
  }

  claimDividends() {
    const contract = this.state.contract
    const account = this.state.account
    return contract.claim({ from: account })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Consensys Final Project by Kevin Ho</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Dividend Bearing Token</h1>
              <h2>Instructions:</h2>
              <p>The following is a Demo of my DividendToken contract, an ERC20 token called "DIV" which can receive ETH, and then allow token holders to withdraw dividends based on the % of total DIV tokens they own. Thanks for trying it out!!</p>
              <p>1. First, send 10 ETH to DIV token contract</p>
              <p>2. Then, mint 10 new DIV tokens to your account</p>
              <p>3. Wait 10 seconds and then refresh the page to update the state</p>
              <p>4. Click "Claim Dividends"</p>
              <p>5. Wait 10 seconds and then refresh the page to see that your ETH dividends have been sent from the token contract to your account. </p>
              <h2>State:</h2>
              <p>Your ETH Balance: {this.state.ethBalance}</p>
              <br/>
              <p>ETH stored in DIV Token Contract: {this.state.divEthBalance}</p>
              <button onClick={this.sendETH.bind(this)}>Send 10 ETH to DIV token contract</button>
              <br/>
              <br/>
              <br/>
              <p>Total DIV Token Supply: {this.state.totalSupply}</p>
              <p>Your DIV Balance: {this.state.divBalance}</p>
              <p>Your % Ownership of DIV: {(this.state.percentage * 100).toFixed(2) + '%'}</p>
              <button onClick={this.mintUserTokens.bind(this)}>Mint 10 new DIV tokens to your account</button>
              <br/>
              <br/>
              <button onClick={this.claimDividends.bind(this)}>Claim Your Dividends</button>

            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
