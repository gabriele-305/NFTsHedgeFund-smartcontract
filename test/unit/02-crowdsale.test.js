const { expect, assert } = require("chai");
const { copyFileSync } = require("fs");
const { deployments, ethers } = require("hardhat");
const { fundCrowdsale } = require("../../utils/fundCrowdsale");

describe("Staking", () => {
  let owner, signer2, signer3;

  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    signer2 = accounts[1];
    signer3 = accounts[2];

    await deployments.fixture(["all"]);
    hedgeFond = await ethers.getContract("NFTsHedgeFund", owner);
    crowdsale = await ethers.getContract("Crowdsale", owner);
  });

  describe("buyTokens", () => {
    it("adds a token symbol", async () => {
      let signer2Balance;
      let signer3Balance;

      await crowdsale.setIsPresaleActiveOrNotActive(true);

      signer2Balance = await crowdsale.getTokenAmount(signer2.address);
      signer3Balance = await crowdsale.getTokenAmount(signer3.address);
      let deployerBalance = await hedgeFond.balanceOf(owner.address);
      let crowdsaleBalance = await hedgeFond.balanceOf(crowdsale.address);
      assert.equal(
        deployerBalance.toString(),
        ethers.utils.parseEther("1000000000").toString()
      );
      assert.equal(crowdsaleBalance.toString(), "0");

      await fundCrowdsale(owner.address);

      deployerBalance = await hedgeFond.balanceOf(owner.address);
      crowdsaleBalance = await hedgeFond.balanceOf(crowdsale.address);

      assert.equal(
        deployerBalance.toString(),
        ethers.utils.parseEther("650000000").toString()
      );
      assert.equal(
        crowdsaleBalance.toString(),
        ethers.utils.parseEther((350000000 * 0.9).toString()).toString()
      );
      expect(signer2Balance).to.be.equal(0);
      expect(signer3Balance).to.be.equal(0);

      const tx1 = await crowdsale.connect(signer2).buyTokens(signer2.address, {
        value: ethers.utils.parseEther("0.000025"),
      });
      const tx2 = await crowdsale.connect(signer3).buyTokens(signer3.address, {
        value: ethers.utils.parseEther("0.00005"),
      });

      const crowdsaleBalanceAfter = await hedgeFond.balanceOf(
        crowdsale.address
      );

      signer2Balance = await crowdsale.getTokenAmount(signer2.address);
      signer3Balance = await crowdsale.getTokenAmount(signer3.address);

      expect(signer2Balance.toString()).to.be.equal(
        ethers.utils.parseEther("100").toString()
      );
      expect(signer3Balance.toString()).to.be.equal(
        ethers.utils.parseEther("200").toString()
      );
      assert.equal(
        crowdsaleBalanceAfter.toString(),
        ethers.utils.parseEther((315000000).toString()).toString()
      );
    });

    it("revert if the presale is not active", async () => {
      await fundCrowdsale();

      await expect(
        crowdsale.connect(signer2).buyTokens(signer2.address, {
          value: ethers.utils.parseEther("0.000025"),
        })
      ).to.be.revertedWith("Crowdsale: presale not active!");
    });

    it("revert if there aren't enough token", async () => {
      await fundCrowdsale();
      await crowdsale.setIsPresaleActiveOrNotActive(true);

      await crowdsale.buyTokens(signer2.address, {
        value: ethers.utils.parseEther("87.499"),
      });
      await expect(
        crowdsale.buyTokens(signer3.address, {
          value: ethers.utils.parseEther("0.005"),
        })
      ).to.be.revertedWith(
        "Crowdsale: Token amount exceded the balance of this contract"
      );
    });
  });
});
