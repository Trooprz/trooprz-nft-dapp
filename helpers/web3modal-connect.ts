// wallet-connect.ts
import { ethers } from "ethers"; // npm install ethers
import providerOptions from "../config/ProviderOptions"
import {useEffect, useState} from "react";
import Web3Modal from "web3modal";

// This is the SDK provided by Wallet Connect
import WalletConnectProvider from "@walletconnect/web3-provider";

import * as config from "../config/config";
import * as utils from "./utils";
import { IWallet, defaultWallet } from "../store/interfaces";

// Main login flow for Crypto.com DeFi Wallet with Wallet Extension
// The connector must be activated, then it exposes a provider
// that is used by the ethers Web3Provider constructor.
export const connect = async (): Promise<IWallet> => {

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
        await web3Modal.toggleModal();
        const ethersProvider = new ethers.providers.Web3Provider(provider);
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
            ...defaultWallet,
            walletProviderName: ethers.providers.Web3Provider.toString(),
            address: (await ethersProvider.listAccounts())[0],
            browserWeb3Provider: ethersProvider,
            wcProvider: provider,
            connected: true,
        };
    } catch (e) {
        window.alert(e);
        return defaultWallet;
    }
};
