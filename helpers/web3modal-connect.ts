import { ethers } from "ethers"; // npm install ethers
import providerOptions from "../config/ProviderOptions"
import Web3Modal from "web3modal";

import * as utils from "./utils";
import {IWallet, defaultWallet, defaultWalletWeb3Modal, IWalletWeb3Modal} from "../store/interfaces";
import {sign} from "crypto";

export const connect = async (): Promise<IWalletWeb3Modal> => {

    let web3Modal;
    if (typeof window !== 'undefined') {
        web3Modal = new Web3Modal({
            cacheProvider: true,
            providerOptions
        })
    }
    try {
        // Reset cache
        localStorage.clear();
        const provider = await web3Modal.connect();
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        console.log(signer)
        ethersProvider.on("accountsChanged", utils.reloadApp);
        ethersProvider.on("chainChanged", utils.reloadApp);
        ethersProvider.on("disconnect", utils.reloadApp);

        // const provider = new WalletConnectProvider({
        //     rpc: {
        //         [config.configVars.rpcNetwork.chainId]:
        //         config.configVars.rpcNetwork.rpcUrl,
        //     },
        //     // This chainId parameter is not mentioned
        //     // in the WalletConnect documentation,
        //     // But is necessary otherwise
        //     // WalletConnect will connect to Ethereum mainnet
        //     chainId: config.configVars.rpcNetwork.chainId,
        // });
        // await provider.enable();
        // const ethersProvider = new ethers.providers.Web3Provider(provider);
        // if (!(provider.chainId === config.configVars.rpcNetwork.chainId)) {
        //     window.alert(
        //         "Switch your Wallet to blockchain network " +
        //         config.configVars.rpcNetwork.chainName
        //     );
        //     return defaultWallet;

        // Subscribe to events that reload the app
        return {
            ...defaultWalletWeb3Modal,
            address: await signer.getAddress(),
             // address: ethers.utils.getAddress("0x14B778414f5af90ec78bc6475E587A344b99db1f"),
            provider: ethersProvider,
            signer: signer,
            connected: true,
        };
    } catch (e) {
        window.alert(e);
        return defaultWalletWeb3Modal;
    }
};
