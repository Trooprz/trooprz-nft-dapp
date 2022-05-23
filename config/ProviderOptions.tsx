import WalletConnect from "@walletconnect/web3-provider";

const providerOptions = {
    walletconnect: {
        package: WalletConnect,
        options: {
            rpc: {
                25: "https://evm.cronos.org/",
            },
            chainId: 25,
            network: "cronos",
            qrcode: true
        }
    },
};
export default providerOptions;
