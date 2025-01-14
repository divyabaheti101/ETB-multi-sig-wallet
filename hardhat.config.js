require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = '7c4638d427766a431b28fa3877386c7287ac6402a12ece341e141c5ffb92420f'
const ALCHEMY_KEY = 'iNCPMT_1qim4yc6JMPGm1uiK4cqUgWp-'
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  paths: {
    sources: './contracts',
    artifacts: './src/artifacts'
  },
  defaultNetwork: 'hardhat',
  networks:{
    hardhat:{
      chainId: 1337
    },
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/iNCPMT_1qim4yc6JMPGm1uiK4cqUgWp-',
      accounts: [PRIVATE_KEY]
    }
  }
};
