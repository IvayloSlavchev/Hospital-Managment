require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",

  networks: {
    hardhat: {
      blockGasLimit: 100000000429720,
      gas: 2100000, 
      gasPrice: 8000000000,
      allowUnlimitedContractSize: true
  },
  }
};
