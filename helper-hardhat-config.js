const networkConfig = {
  31337: {
    name: "localhost",
    uniswapRouterAddress: "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
    uniswapPoolAddress: "0xA35CFDdBFD907AB53f59ADBDeB3844c2DB4316AB",
  },
  5: {
    name: "goerli",
    uniswapRouterAddress: "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
    uniswapPoolAddress: "0xA35CFDdBFD907AB53f59ADBDeB3844c2DB4316AB",
  },
};

const INITIAL_SUPPLY = "1000000000000000000000000000";
const INITIAL_PRICE = "200000000000000000000";
const developmentChains = ["hardhat", "localhost"];
const frontEndContractsFile = "../site/costants/contractAddresses.json";
const frontEndAbiFile = "../site/costants/abi.json";

module.exports = {
  networkConfig,
  developmentChains,
  INITIAL_PRICE,
  INITIAL_SUPPLY,
  frontEndContractsFile,
  frontEndAbiFile,
};
