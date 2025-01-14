// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require('hardhat');

const [owner1, owner2, owner3] = await ethers.getSigners();
const qourum = 2;

module.exports = buildModule("MultiSigWalletModule", (m) => {
  
  const multiSigWallet = m.contract("MultiSigWallet", [owner1.address, owner2.address, owner3.address], qourum);

  return { multiSigWallet };
});
