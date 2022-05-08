import { ethers } from "ethers"; // npm install ethers
import providerOptions from "../config/ProviderOptions"
import Web3Modal from "web3modal";

import * as utils from "./utils";
import {defaultWalletWeb3Modal, IWalletWeb3Modal} from "../store/interfaces";

export const connect = async (): Promise<IWalletWeb3Modal> => {

    let web3Modal;
    if (typeof window !== 'undefined') {
        web3Modal = new Web3Modal({
            providerOptions,
        })
    }
    try {
        // Reset cache
        localStorage.clear();
        const provider = await web3Modal.connect();
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        ethersProvider.on("accountsChanged", utils.reloadApp);
        ethersProvider.on("chainChanged", utils.reloadApp);
        ethersProvider.on("disconnect", utils.reloadApp);
        return {
            ...defaultWalletWeb3Modal,
            address: await signer.getAddress(),
            provider: ethersProvider,
            signer: signer,
            connected: true,
        };
    } catch (e) {
        window.alert(e);
        return defaultWalletWeb3Modal;
    }
};
