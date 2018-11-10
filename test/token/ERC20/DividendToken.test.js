const { assertRevert } = require('../../helpers/assertRevert');
const expectEvent = require('../../helpers/expectEvent');
const { ether } = require('../../helpers/ether');
const { ethGetBalance } = require('../../helpers/web3');

const DividendToken = artifacts.require('DividendTokenMock');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('DividendToken', function ([_, owner, recipient, anotherAccount]) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  const value = ether(1);
  expectedDividends = value.div(new BigNumber(2));

  beforeEach(async function () {
    this.token = await DividendToken.new(owner, 50);
    this.token.mint(recipient, 50);
  });

  describe('total supply', function () {
    it('returns the total amount of tokens', async function () {
      (await this.token.totalSupply()).should.be.bignumber.equal(100);
    });
  });

  describe('balanceOf', function () {
    describe('when the requested account has no tokens', function () {
      it('returns zero', async function () {
        (await this.token.balanceOf(anotherAccount)).should.be.bignumber.equal(0);
      });
    });

    describe('when the requested account has some tokens', function () {
      it('returns the total amount of tokens', async function () {
        (await this.token.balanceOf(owner)).should.be.bignumber.equal(50);
      });
    });
  });

  describe('transfer', function () {
    describe('when the recipient is not the zero address', function () {
      const to = recipient;

      describe('when the sender does not have enough balance', function () {
        const amount = 51;

        it('reverts', async function () {
          await assertRevert(this.token.transfer(to, amount, { from: owner }));
        });
      });

      describe('when the sender has enough balance', function () {
        const amount = 50;

        it('transfers the requested amount', async function () {
          await this.token.transfer(to, amount, { from: owner });

          (await this.token.balanceOf(owner)).should.be.bignumber.equal(0);

          (await this.token.balanceOf(to)).should.be.bignumber.equal(100);
        });

        it('emits a transfer event', async function () {
          const { logs } = await this.token.transfer(to, amount, { from: owner });

          const event = expectEvent.inLogs(logs, 'Transfer', {
            from: owner,
            to: to,
          });

          event.args.value.should.be.bignumber.equal(amount);
        });
      });
    });

    describe('when the recipient is the zero address', function () {
      const to = ZERO_ADDRESS;

      it('reverts', async function () {
        await assertRevert(this.token.transfer(to, 100, { from: owner }));
      });
    });
  });

  describe('accepting payments', function () {
    describe('bare payments', function () {
      it('should accept payments', async function () {
        await this.token.send(value, { from: anotherAccount });
      });
      it('should update totalDividends', async function () {
        await this.token.send(value, { from: anotherAccount });
        (await this.token.totalDividends()).should.be.bignumber.equals(value);
      });
      it('should update unclaimedDividends', async function () {
        await this.token.send(value, { from: anotherAccount });
        (await this.token.unclaimedDividends()).should.be.bignumber.equals(value);
      });
      it('reverts on zero-valued payments', async function () {
        await assertRevert(
          this.token.send(0, { from: anotherAccount })
        );
      });
    });
    describe('send funds', function () {
      it('should accept payments', async function () {
        await this.token.sendFunds({ value: value, from: anotherAccount });
      });
      it('reverts on zero-valued payments', async function () {
        await assertRevert(
          this.token.sendFunds({ value: 0, from: anotherAccount })
        );
      });
    });
  });

  describe('distribute dividends', function () {
    describe('update accounts (claim dividends)', function () {
      it('should allow users to claim dividends', async function () {
        await this.token.send(value, { from: anotherAccount });
        const pre = await ethGetBalance(recipient);
        const receipt = await this.token.claim({from: recipient});
        const gasUsed = receipt.receipt.gasUsed;
         // console.log(`GasUsed: ${receipt.receipt.gasUsed}`);
        const tx = await web3.eth.getTransaction(receipt.tx);
        const gasPrice = tx.gasPrice;
         // console.log(`GasPrice: ${tx.gasPrice}`);
        const post = await ethGetBalance(recipient);
        post.minus(pre).should.be.bignumber.equal(expectedDividends.minus(gasPrice.mul(gasUsed)));
      });
      it('should distribute dividends on transfer', async function () {
        await this.token.send(value, { from: anotherAccount });
        const preOwner = await ethGetBalance(owner);
        const preRecipient = await ethGetBalance(recipient);
        const receipt = await this.token.transfer(recipient, 25, { from: owner });
        const gasUsed = receipt.receipt.gasUsed;
         // console.log(`GasUsed: ${receipt.receipt.gasUsed}`);
        const tx = await web3.eth.getTransaction(receipt.tx);
        const gasPrice = tx.gasPrice;
         // console.log(`GasPrice: ${tx.gasPrice}`);
        const postOwner = await ethGetBalance(owner);
        const postRecipient = await ethGetBalance(recipient);
        postOwner.minus(preOwner).should.be.bignumber.equal(expectedDividends.minus(gasPrice.mul(gasUsed)));
        postRecipient.minus(preRecipient).should.be.bignumber.equal(expectedDividends);
      });
    });
    describe('transferFrom', function () {
      const amount = 25;
      beforeEach(async function () {
        await this.token.approve(anotherAccount, 25, { from: owner });
      });
      it('should distribute dividends when the spender has enough approved balance', async function () {
        await this.token.send(value, { from: anotherAccount });
        const preOwner = await ethGetBalance(owner);
        const preRecipient = await ethGetBalance(recipient);
        await this.token.transferFrom(owner, recipient, 25, { from: anotherAccount });
        const postOwner = await ethGetBalance(owner);
        const postRecipient = await ethGetBalance(recipient);
        postOwner.minus(preOwner).should.be.bignumber.equal(expectedDividends);
        postRecipient.minus(preRecipient).should.be.bignumber.equal(expectedDividends);
      });
      it('reverts when the spender does not have enough approved balance', async function () {
        await assertRevert(this.token.transferFrom(owner, recipient, 30, { from: anotherAccount }));
      });
    });
  });
});
