const { ethers, getNamedAccounts } = require("hardhat");

const fundCrowdsale = async () => {
  const { deployer } = await getNamedAccounts();
  console.log("funding crowdsale...");
  const hedgeFund = await ethers.getContract("NFTsHedgeFund", deployer);
  const crowdsale = await ethers.getContract("Crowdsale");
  const value = ethers.utils.parseEther("350000000"); //35

  try {
    await hedgeFund.transfer(crowdsale.address, value);
    console.log("funded!");
  } catch (e) {
    console.log(e);
  }
};

module.exports = { fundCrowdsale };
