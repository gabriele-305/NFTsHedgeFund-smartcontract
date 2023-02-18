const { network } = require("hardhat");
const { verify } = require("../utils/verify");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("-------------------------------");

  const args = [];

  const hedgeFund = await deploy("NFTsHedgeFund", {
    from: deployer,
    log: true,
    args: args,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (!developmentChains.includes(network.name)) {
    await verify(hedgeFund.address, args);
  }

  log("-------------------------------");
};

module.exports.tags = ["all", "token"];
