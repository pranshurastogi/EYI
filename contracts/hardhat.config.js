require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  // Our Solidity sources live at the root of this folder
  // so we point Hardhat's sources path to "." to avoid moving files.
  paths: {
    sources: "./",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    hardhat: {},
    celoSepolia: {
      url: process.env.CELO_SEPOLIA_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  mocha: {
    timeout: 60000
  }
};

module.exports = config;

