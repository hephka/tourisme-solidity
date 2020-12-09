/* eslint-disable camelcase */

const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();
const mnemonic = process.env.MNEMONIC;
const projectId = process.env.ENDPOINT_ID;

module.exports = {
  networks: {
      development: {
      host: '127.0.0.1', // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: '*', // Any network (default: none)
    },
    rinkeby: {
      networkCheckTimeout: 100000,
      provider: () =>
        new HDWalletProvider({
          mnemonic: {
            phrase: mnemonic,
          },
          providerOrUrl: "wss://rinkeby.infura.io/ws/v3/" + projectId,
          numberOfAddresses: 1,
          shareNonce: true,
        }),
     network_id: 4,
      gas: 6721975,
      confirmations: 0,
      timeoutBlocks: 200,
      //websockets: true,
      skipDryRun: true,
    },
 },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: 'native', // Fetch exact version from solc-bin (default: truffle's version)
    },
  },
};
