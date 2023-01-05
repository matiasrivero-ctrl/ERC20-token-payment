const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('TokenPaymentSplitter Tests', () => {
  let deployer;
  let accountOne;
  let accountTwo;
  let accountThree;
  let accountFour;
  let testPaymentToken;
  let mockPool;

  beforeEach(async () => {
    [deployer, accountOne, accountTwo, accountThree, accountFour] =
      await ethers.getSigners();

    const TestPaymentToken = await ethers.getContractFactory(
      'ERC20PresetMinterPauser'
    );

    testPaymentToken = await TestPaymentToken.deploy('TestPaymentToken', 'TPT');
    await testPaymentToken.deployed();
  });

  describe('Add payees with varying amounts and distribute payments', async () => {
    it('payment token is distributed evenly to multiple payees', async () => {
      payeeAddressArray = [
        accountOne.address,
        accountTwo.address,
        accountThree.address,
        accountFour.address,
      ];

      payeeShareArray = [10, 10, 10, 10];

      console.log(testPaymentToken.address);

      const MockPool = await ethers.getContractFactory('MockPool');

      mockPool = await MockPool.deploy(
        payeeAddressArray,
        payeeShareArray,
        testPaymentToken.address
      );

      await mockPool.deployed();

      await testPaymentToken.mint(mockPool.address, 100000);

      await mockPool.connect(accountOne).release(accountOne.address);
      await mockPool.connect(accountTwo).release(accountTwo.address);
      await mockPool.connect(accountThree).release(accountThree.address);
      await mockPool.connect(accountFour).release(accountFour.address);

      const accountOneTokenBalance = await testPaymentToken.balanceOf(
        accountOne.address
      );
      const accountTwoTokenBalance = await testPaymentToken.balanceOf(
        accountTwo.address
      );
      const accountThreeTokenBalance = await testPaymentToken.balanceOf(
        accountThree.address
      );
      const accountFourTokenBalance = await testPaymentToken.balanceOf(
        accountFour.address
      );

      expect(accountOneTokenBalance).to.equal(25000);
      expect(accountTwoTokenBalance).to.equal(25000);
      expect(accountThreeTokenBalance).to.equal(25000);
      expect(accountFourTokenBalance).to.equal(25000);
    });

    it('payment token is distributed unevenly to multiple payees', async () => {
      payeeAddressArray = [
        accountOne.address,
        accountTwo.address,
        accountThree.address,
        accountFour.address,
      ];

      payeeShareArray = [10, 5, 11, 7];

      const MockPool = await ethers.getContractFactory('MockPool');

      mockPool = await MockPool.deploy(
        payeeAddressArray,
        payeeShareArray,
        testPaymentToken.address
      );

      await mockPool.deployed();

      await testPaymentToken.mint(mockPool.address, 100000);

      await mockPool.connect(accountOne).release(accountOne.address);
      await mockPool.connect(accountTwo).release(accountTwo.address);
      await mockPool.connect(accountThree).release(accountThree.address);
      await mockPool.connect(accountFour).release(accountFour.address);

      const accountOneTokenBalance = await testPaymentToken.balanceOf(
        accountOne.address
      );
      const accountTwoTokenBalance = await testPaymentToken.balanceOf(
        accountTwo.address
      );
      const accountThreeTokenBalance = await testPaymentToken.balanceOf(
        accountThree.address
      );
      const accountFourTokenBalance = await testPaymentToken.balanceOf(
        accountFour.address
      );

      const mockPoolTestPaymentTokenBalance = await testPaymentToken.balanceOf(
        mockPool.address
      );

      expect(mockPoolTestPaymentTokenBalance).to.equal(1);
      expect(accountOneTokenBalance).to.equal(30303);
      expect(accountTwoTokenBalance).to.equal(15151);
      expect(accountThreeTokenBalance).to.equal(33333);
      expect(accountFourTokenBalance).to.equal(21212);
    });

    it('payment token is distributed unevenly to multiple payees with additional payment token sent to pool', async () => {
      payeeAddressArray = [
        accountOne.address,
        accountTwo.address,
        accountThree.address,
        accountFour.address,
      ];

      payeeShareArray = [10, 5, 11, 7];

      const MockPool = await ethers.getContractFactory('MockPool');

      mockPool = await MockPool.deploy(
        payeeAddressArray,
        payeeShareArray,
        testPaymentToken.address
      );

      await mockPool.deployed();

      await testPaymentToken.mint(mockPool.address, 100000);

      await mockPool.connect(accountOne).release(accountOne.address);
      await mockPool.connect(accountTwo).release(accountTwo.address);

      await testPaymentToken.mint(mockPool.address, 100000);

      await mockPool.connect(accountThree).release(accountThree.address);
      await mockPool.connect(accountFour).release(accountFour.address);
      await mockPool.connect(accountOne).release(accountOne.address);
      await mockPool.connect(accountTwo).release(accountTwo.address);

      const accountOneTokenBalance = await testPaymentToken.balanceOf(
        accountOne.address
      );
      const accountTwoTokenBalance = await testPaymentToken.balanceOf(
        accountTwo.address
      );
      const accountThreeTokenBalance = await testPaymentToken.balanceOf(
        accountThree.address
      );
      const accountFourTokenBalance = await testPaymentToken.balanceOf(
        accountFour.address
      );

      const mockPoolTestPaymentTokenBalance = await testPaymentToken.balanceOf(
        mockPool.address
      );

      expect(mockPoolTestPaymentTokenBalance).to.equal(1);
      expect(accountOneTokenBalance).to.equal(60606);
      expect(accountTwoTokenBalance).to.equal(30303);
      expect(accountThreeTokenBalance).to.equal(66666);
      expect(accountFourTokenBalance).to.equal(42424);
    });
  });
});
