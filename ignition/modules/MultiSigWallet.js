// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MultiSigWalletModule", (m) => {
  const owner1 = m.getAccount(0);
  const owner2 = m.getAccount(1);
  const owner3 = m.getAccount(2);
  const qourum = 2;
  const multiSigWallet = m.contract("MultiSigWallet", [[owner1, owner2, owner3], qourum]);

  return { multiSigWallet };
});
