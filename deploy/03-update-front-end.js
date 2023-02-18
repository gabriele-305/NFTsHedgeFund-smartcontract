const {
  frontEndContractsFile,
  frontEndAbiFile,
} = require("../helper-hardhat-config");
const fs = require("fs");
const { network } = require("hardhat");

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Writing to front end...");
    await updateContractAddresses();
    await updateAbi();
    console.log("Front end written!");
  }
};

async function updateAbi() {
  const crowdsale = await ethers.getContract("Crowdsale");
  fs.writeFileSync(
    frontEndAbiFile,
    crowdsale.interface.format(ethers.utils.FormatTypes.json)
  );
}

async function updateContractAddresses() {
  const crowdsale = await ethers.getContract("Crowdsale");
  const contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, "utf8")
  );
  if (network.config.chainId.toString() in contractAddresses) {
    if (
      !contractAddresses[network.config.chainId.toString()].includes(
        crowdsale.address
      )
    ) {
      contractAddresses[network.config.chainId.toString()].unshift(
        crowdsale.address
      );
    }
  } else {
    contractAddresses[network.config.chainId.toString()] = [crowdsale.address];
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
}
module.exports.tags = ["all", "frontend"];
