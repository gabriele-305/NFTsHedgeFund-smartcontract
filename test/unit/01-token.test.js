const { network, deployments, ethers } = require("hardhat");
const { assert, expect, use } = require("chai");
const {
  developmentChains,
  INITIAL_SUPPLY,
} = require("../../helper-hardhat-config");
const { Signer } = require("ethers");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("hedgeFund Unit Test", function () {
      const multiplier = 10 ** 18;
      let hedgeFund, deployer, user1;

      beforeEach(async function () {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user1 = accounts[1];

        await deployments.fixture(["token"]);
        hedgeFund = await ethers.getContract("NFTsHedgeFund", deployer);
      });

      it("was deployed", async function () {
        assert(hedgeFund.address);
      });

      describe("Constructor", function () {
        it("shuold have correctly initialize INITIAL SUPPLY", async function () {
          const totalSupply = await hedgeFund.totalSupply();
          assert.equal(totalSupply.toString(), INITIAL_SUPPLY);
        });

        it("initialize the token with the correct name and symbol", async function () {
          const name = (await hedgeFund.name()).toString();
          const symbol = (await hedgeFund.symbol()).toString();

          assert.equal(name, "NFTs Hedge Fund");
          assert.equal(symbol, "NHF");
        });
      });

      describe("transfer", () => {
        it("shuold be able to transfer token successfully to an address", async () => {
          const tokenToSend = ethers.utils.parseEther("10");
          const oldSupply = await hedgeFund.totalSupply();
          await hedgeFund.transfer(user1.address, tokenToSend);
          const fundBalance = await hedgeFund.balanceOf(hedgeFund.address);
          const newSupply = await hedgeFund.totalSupply();
          const expectedFundBalance = ((tokenToSend * 8) / 100).toString();
          const expectedFinalSupply = oldSupply - (tokenToSend * 2) / 100;
          expect(
            (await hedgeFund.balanceOf(user1.address)).toString()
          ).to.be.equal(
            ethers.utils.parseEther((tokenToSend * 0, 9).toString())
          );
          assert.equal(fundBalance.toString(), expectedFundBalance);
          assert.equal(newSupply.toString(), expectedFinalSupply);
        });

        it("emits an transfer event, when an transfer occurs", async () => {
          await expect(
            hedgeFund.transfer(user1.address, (10 * multiplier).toString())
          ).to.emit(hedgeFund, "Transfer");
        });
      });

      describe("Allowance", function () {
        const amount = (20 * multiplier).toString();
        beforeEach(async function () {
          playerToken = await ethers.getContract(
            "NFTsHedgeFund",
            user1.address
          );
        });

        it("should approve other address to spend token", async function () {
          const tokenToSpend = ethers.utils.parseEther("5");
          await hedgeFund.approve(user1.address, tokenToSpend);
          const hedgeFund1 = await ethers.getContract(
            "NFTsHedgeFund",
            user1.address
          );
          const oldSupply = await hedgeFund.totalSupply();
          await hedgeFund1.transferFrom(
            deployer.address,
            user1.address,
            tokenToSpend
          );
          const fundBalance = await hedgeFund.balanceOf(hedgeFund.address);
          const newSupply = await hedgeFund.totalSupply();
          const expectedFundBalance = ((tokenToSpend * 8) / 100).toString();
          const expectedFinalSupply = oldSupply - (tokenToSpend * 2) / 100;
          expect(
            (await hedgeFund1.balanceOf(user1.address)).toString()
          ).to.be.equal((tokenToSpend * 0.9).toString());
          assert.equal(fundBalance.toString(), expectedFundBalance);
          assert.equal(newSupply.toString(), expectedFinalSupply);
        });

        it("doesn't allow an unapproved user to transfer", async function () {
          await expect(
            playerToken.transferFrom(deployer.address, user1.address, amount)
          ).to.be.revertedWith("ERC20: insufficient allowance");
        });

        it("emits an approval event, when an approval occurs", async function () {
          await expect(hedgeFund.approve(user1.address, amount)).to.emit(
            hedgeFund,
            "Approval"
          );
        });

        it("the allowance being set is accurate", async function () {
          await hedgeFund.approve(user1.address, amount);
          const allowance = await hedgeFund.allowance(
            deployer.address,
            user1.address
          );
          assert.equal(allowance.toString(), amount);
        });

        it("won't allow a user to go over allowance", async function () {
          await hedgeFund.approve(user1.address, amount);
          await expect(
            playerToken.transferFrom(
              deployer.address,
              user1.address,
              (40 * multiplier).toString()
            )
          ).to.be.revertedWith("ERC20: insufficient allowance");
        });
      });

      describe("Fee", () => {
        it("change and verify the fee", async () => {
          await hedgeFund.setFundFee(10);
          await hedgeFund.setBurnFee(10);
          const tokenToSend = ethers.utils.parseEther("30");
          const oldSupply = await hedgeFund.totalSupply();
          await hedgeFund.transfer(user1.address, tokenToSend);
          const fundBalance = await hedgeFund.balanceOf(hedgeFund.address);
          const newSupply = await hedgeFund.totalSupply();
          const expectedFundBalance = ((tokenToSend * 10) / 100).toString();
          const expectedFinalSupply = oldSupply - (tokenToSend * 10) / 100;
          const newFundFee = await hedgeFund.getFundFee();
          const newBurnFee = await hedgeFund.getBurnFee();
          const decimals = (await hedgeFund.decimals()) - 18;
          assert.equal(newBurnFee, 10);
          assert.equal(newFundFee, 10);
          assert.equal(
            (await hedgeFund.balanceOf(user1.address)).toString(),
            (tokenToSend * 0.8).toString()
          );
          assert.equal(fundBalance.toString(), expectedFundBalance);
          assert.equal(newSupply.toString(), expectedFinalSupply);
        });

        it("doesn't allow a user to change the fee", async () => {
          const hedgeFund1 = await ethers.getContract(
            "NFTsHedgeFund",
            user1.address
          );
          await expect(hedgeFund1.setBurnFee(9)).to.be.revertedWith(
            "Ownable: caller is not the owner"
          );
          await expect(hedgeFund1.setFundFee(9)).to.be.revertedWith(
            "Ownable: caller is not the owner"
          );
        });

        it("put to 0 the fee", async () => {
          await hedgeFund.setBurnFee(0);
          await hedgeFund.setFundFee(0);
          const tokenToSend = ethers.utils.parseEther("30");
          const oldSupply = await hedgeFund.totalSupply();
          const oldFundBalance = await hedgeFund.balanceOf(hedgeFund.address);
          await hedgeFund.transfer(user1.address, tokenToSend);
          const fundBalance = await hedgeFund.balanceOf(hedgeFund.address);
          const newSupply = await hedgeFund.totalSupply();
          const newFundFee = await hedgeFund.getFundFee();
          const newBurnFee = await hedgeFund.getBurnFee();
          assert.equal(newBurnFee, 0);
          assert.equal(newFundFee, 0);
          assert.equal(
            (await hedgeFund.balanceOf(user1.address)).toString(),
            tokenToSend.toString()
          );
          assert.equal(fundBalance.toString(), oldFundBalance.toString());
          assert.equal(newSupply.toString(), oldSupply.toString());
        });
      });

      describe("Mint and burn function", () => {
        it("shuold revert if the caller is not the owner", async () => {
          const hedgeFund1 = await ethers.getContract(
            "NFTsHedgeFund",
            user1.address
          );
          await expect(
            hedgeFund1.mint(ethers.utils.parseEther("10"))
          ).to.be.revertedWith("Ownable: caller is not the owner");
          await expect(
            hedgeFund1.burn(ethers.utils.parseEther("10"))
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("verify the correctness of the mint and burn function", async () => {
          let totalSupply = await hedgeFund.totalSupply();
          assert.equal(
            totalSupply.toString(),
            ethers.utils.parseEther("1000000000").toString()
          );

          await hedgeFund.mint(ethers.utils.parseEther("10"));
          totalSupply = await hedgeFund.totalSupply();
          assert.equal(
            totalSupply.toString(),
            ethers.utils.parseEther("1000000010").toString()
          );

          await hedgeFund.burn(ethers.utils.parseEther("8"));
          totalSupply = await hedgeFund.totalSupply();
          assert.equal(
            totalSupply.toString(),
            ethers.utils.parseEther("1000000002").toString()
          );
        });
      });

      describe("senderNoFee", () => {
        it("revert if is not called by the owner", async () => {
          await expect(
            hedgeFund.connect(user1.address).setAddressNoFee(user1.address)
          ).to.be.reverted;
        });

        it("cannot set an address again", async () => {
          await hedgeFund.setAddressNoFee(deployer.address);

          await expect(
            hedgeFund.setAddressNoFee(deployer.address)
          ).to.be.revertedWith(
            "Crowdsale: the address has already been set as without fee"
          );
        });

        it("cannot remove a non set address", async () => {
          await expect(
            hedgeFund.removeAddressNoFee(deployer.address)
          ).to.be.revertedWith(
            "Crowdsale: the address hasn't been set as without fee"
          );
        });

        it("zero fee if the address is the receiver or the sender", async () => {
          await hedgeFund.setAddressNoFee(user1.address);
          let balancePre = await hedgeFund.balanceOf(user1.address);

          await hedgeFund.transfer(user1.address, ethers.utils.parseEther("2"));

          let balancePost = await hedgeFund.balanceOf(user1.address);
          assert.equal(
            (balancePost - balancePre).toString(),
            ethers.utils.parseEther("2").toString()
          );

          balancePre = await hedgeFund.balanceOf(deployer.address);

          await hedgeFund
            .connect(user1)
            .transfer(deployer.address, ethers.utils.parseEther("2"));

          balancePost = await hedgeFund.balanceOf(deployer.address);
          assert.equal(
            (balancePost - balancePre).toString(),
            ethers.utils.parseEther("2").toString()
          );

          await hedgeFund.removeAddressNoFee(user1.address);
          balancePre = await hedgeFund.balanceOf(user1.address);

          await hedgeFund
            .connect(deployer)
            .transfer(user1.address, ethers.utils.parseEther("2"));

          balancePost = await hedgeFund.balanceOf(user1.address);
          assert.equal(
            (balancePost - balancePre).toString(),
            ethers.utils.parseEther("1.8").toString()
          );

          balancePre = await hedgeFund.balanceOf(deployer.address);

          await hedgeFund
            .connect(user1)
            .transfer(deployer.address, ethers.utils.parseEther("1"));

          balancePost = await hedgeFund.balanceOf(deployer.address);
          assert.equal(
            ((balancePost - balancePre) / 10 ** 18).toString(),
            "0.9"
          );
        });
      });
    });
