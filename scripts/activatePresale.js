const { getNamedAccounts } = require("hardhat");

const activatePresale = async () => {
  const { deployer } = await getNamedAccounts();
  console.log("activating presale...");

  const crowdsale = await ethers.getContract("Crowdsale", deployer);
  try {
    await crowdsale.setIsPresaleActiveOrNotActive(true);
  } catch (e) {
    console.log(e);
  }

  console.log("presale activated!");
};

activatePresale()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
