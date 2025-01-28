import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  mocha: {
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: './test-results',
      reportFilename: 'x1coin-tests',
      overwrite: true,
      html: true,
      json: true,
      quiet: false,
      timestamp: true
    }
  }
};

export default config;
