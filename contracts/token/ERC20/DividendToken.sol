pragma solidity ^0.4.24;

import "./PausableToken.sol";
import "../../math/SafeMath.sol";


/**
 * @title Dividend token
 * @dev PausableToken modified to distribute dividends to token holders
 **/
contract DividendToken is PausableToken {
  using SafeMath for uint256;

  mapping(address => uint) public lastDividends;

  uint public totalDividends;

  uint public unclaimedDividends;

  /**
   * @dev payable fallback
   */
  function () external payable {
    sendFunds();
  }

  /**
   * @dev calculate amount of ETH dividends owed to the specified account.
   * @param account whose dividends are to be calculated.
   */

  function dividendsOwing(address account)
    internal
    view
    returns(uint)
  {
    uint newDividends = totalDividends.sub(lastDividends[account]);
    return (balanceOf(account).mul(newDividends)).div(totalSupply());
  }

  /**
   * @dev send specified account their owed dividends.
   * @param account whose dividends are to be disbursed.
   */

  modifier updateAccount(address account) {
    uint owing = dividendsOwing(account);
    if(owing > 0) {
      unclaimedDividends = unclaimedDividends.sub(owing);
      lastDividends[account] = totalDividends;
      account.transfer(owing);
    }
    _;
  }

  /**
   * @dev Receive funds that will be disbursed to token holders.
   */

  function sendFunds() public payable {
    uint256 weiAmount = msg.value;
    require(weiAmount != 0);
    totalDividends = totalDividends.add(weiAmount);
    unclaimedDividends = unclaimedDividends.add(weiAmount);
  }

  /**
   * @dev Claim dividends.
   */
  function claim()
    public
    whenNotPaused
    updateAccount(msg.sender)
  {}

  function transfer(
    address _to,
    uint256 _value
  )
    public
    updateAccount(msg.sender)
    updateAccount(_to)
    returns (bool)
  {
    return super.transfer(_to, _value);
  }

  function transferFrom(
    address _from,
    address _to,
    uint256 _value
  )
    public
    updateAccount(_from)
    updateAccount(_to)
    returns (bool)
  {
    return super.transferFrom(_from, _to, _value);
  }

}
