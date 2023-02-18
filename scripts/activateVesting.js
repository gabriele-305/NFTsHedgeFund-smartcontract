const { getNamedAccounts } = require("hardhat");

const activateVesting = async () => {
  const { deployer } = await getNamedAccounts();
  console.log("activating vesting...");

  const crowdsale = await ethers.getContract("Crowdsale", deployer);
  try {
    await crowdsale.activate();
  } catch (e) {
    console.log(e);
  }

  console.log("vesting activated!");
};

activateVesting()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
