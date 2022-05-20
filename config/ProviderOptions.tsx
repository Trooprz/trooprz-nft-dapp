import WalletConnect from "@walletconnect/web3-provider";

const providerOptions = {
    walletconnect: {
        package: WalletConnect,
        options: {
            rpc: {
                338: "https://cronos-testnet-3.crypto.org:8545/",
            },
            chainId: 338,
            network: "cronos-testnet",
            qrcode: true
        }
    },
};
export default providerOptions;
