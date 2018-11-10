var DividendToken = artifacts.require("./DividendTokenMock.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(DividendToken, accounts[1], 90)
};
