const { fundCrowdsale } = require("../utils/fundCrowdsale");

fundCrowdsale()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
