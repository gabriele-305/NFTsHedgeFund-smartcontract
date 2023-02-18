const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const hedgeFund = await ethers.getContract("NFTsHedgeFund", deployer);

  log("-------------------------------");

  const rate = 1 / 0.00000025;
  log("rate: ", rate);
  const args = [rate, deployer, hedgeFund.address];

  const crowdsale = await deploy("Crowdsale", {
    from: deployer,
    log: true,
    args: args,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  /*await hedgeFund.transfer(
    crowdsale.address,
    ethers.utils.parseEther("350000000") //35
  );*/

  if (!developmentChains.includes(network.name)) {
    await verify(crowdsale.address, args);
  }

  log("-------------------------------");
};

module.exports.tags = ["all", "crowdsale"];
