pragma solidity ^0.4.24;

import "../token/ERC20/DividendToken.sol";


// mock class using StandardToken
contract DividendTokenMock is DividendToken {

  constructor(address _initialAccount, uint256 _initialBalance) public {
    _mint(_initialAccount, _initialBalance);
  }

  function mint(address _account, uint256 _amount) public {
    _mint(_account, _amount);
  }

}
