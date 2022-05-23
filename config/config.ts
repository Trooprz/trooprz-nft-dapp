// config/config.ts
export const configVars = {
  mode: "regular",
  rpcNetwork: {
    rpcUrl: "https://cronos-testnet-3.crypto.org:8545/",
    chainId: 338,
    chainIdHex: "0x152",
    chainName: "Cronos Testnet",
    chainType: "mainnet",
    nativeCurrency: {
      name: "tCRO",
      symbol: "tCRO",
      decimals: 18,
    },
    blockExplorerUrl: "https://cronos.crypto.org/explorer/testnet3/",
  },
  rpcNetwork_mainnet: {
    rpcUrl: "https://evm.cronos.org/",
    chainId: 25,
    chainIdHex: "0x19",
    chainName: "Cronos Mainnet Beta",
    chainType: "mainnet",
    nativeCurrency: {
      name: "CRO",
      symbol: "CRO",
      decimals: 18,
    },
    blockExplorerUrl: "https://cronoscan.com/",
  },
  erc20: {
    address: "0x64FD05b6b0726d68cDc9bF6061c29b10544d7b92", // Mutantz on Cronos Testnet
    microbesAddress: "0x96628048830a499b156aBdC04cC169C18c3A17f2", // miCRObes on testnet
    trooprzAddres: "0x140559b57C6e8C178ddeA899146E7a199624B340", // trooprz on testnet
    address_mainnet: "0x3987bB060a433F01a19a5d2e790cE67C8AEB9f9c", // on Cronos Mainnet
  },
  logo: {
    defiwallet:
      "data:image/png;base64,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",
  },
};

