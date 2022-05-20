import {BigNumber, ethers} from "ethers";
import * as config from "../config/config";
import Microbes from "../artifacts/Microbes.json";
import SuperTrooprz from "../artifacts/SuperTrooprz.json";

const microbesAddress = '0x96628048830a499b156aBdC04cC169C18c3A17f2'
const microbesABI = Microbes.abi
let tokensInWallet = [];
let goldenMicrobesInWallet = [];
let ineligibleTokensInWallet = [];

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const hexToInt = (s: string) => {
    const bn = ethers.BigNumber.from(s);
    return parseInt(bn.toString());
};

export const reloadApp = () => {
    window.location.reload();
};

// Get the CRO balance of address
export const getCroBalance = async (
    serverWeb3Provider,
    signer,
    address: string
): Promise<number> => {
    const balance = await serverWeb3Provider.getBalance(address);
    // Balance is rounded at 2 decimals instead of 18, to simplify the UI
    return (
        ethers.BigNumber.from(balance)
            .div(ethers.BigNumber.from("10000000000000000"))
            .toNumber() / 100
    );
};

export const getTokenBalance = async (
    serverWeb3Provider,
): Promise<number> => {
    const contract = new ethers.Contract(
        microbesAddress,
        microbesABI,
        serverWeb3Provider
    )
    await serverWeb3Provider.send("eth_requestAccounts", []);
    const signer = serverWeb3Provider.getSigner();
    const address = await signer.getAddress();
    const contractWithSigner = contract.connect(signer);
    return await contractWithSigner.balanceOf(address);
}

export const getBalance = async (
    serverWeb3Provider,
    address: string
): Promise<number> => {
    // Create ethers.Contract object using the smart contract's ABI
    const contractAbi = SuperTrooprz.abi;
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.superTrooprzAddress,
        contractAbi,
        serverWeb3Provider
    );
    const contractResponse = await readContractInstance["balanceOf"](address);
    // Balance is rounded at 2 decimals instead of 18, to simplify UI
    return (
        ethers.BigNumber.from(contractResponse).toNumber()
    );
};

export const getTotalSupplyLeft = async (
    serverWeb3Provider,
): Promise<number> => {
    const contractAbi = Microbes.abi;
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.address,
        contractAbi,
        serverWeb3Provider
    );
    const currentSupply = BigNumber.from(await readContractInstance["totalSupply"]()).toNumber();
    return currentSupply;
};

export const getTokensInWallet = async (
    serverWeb3Provider,
    address: string,
    amount
): Promise<String[]> => {
    const contractAbi = Microbes.abi;
    const smContractAbi = SuperTrooprz.abi;
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.superTrooprzAddress,
        smContractAbi,
        serverWeb3Provider
    );
    const readMicrobesContractInstance = new ethers.Contract(
        config.configVars.erc20.address,
        contractAbi,
        serverWeb3Provider
    );
    for (let i = 0; i < amount; i++) {
        tokensInWallet[i] = BigNumber.from(await readContractInstance["tokenOfOwnerByIndex"](address, i)).toString();
    }
    // for (let i = 0; i < tokensInWallet.length; i++) {
    //     if (await readMicrobesContractInstance["checkIfTokenUsedBefore"](tokensInWallet[i])) {
    //         tokensInWallet[i] = null;
    //     }
    // }
    return tokensInWallet;
};

export const getGoldenMicrobesInWallet = async (
    serverWeb3Provider,
    address: string,
    amount
): Promise<String[]> => {
    const contractAbi = Microbes.abi;
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.superTrooprzAddress,
        serverWeb3Provider
    );
    const readMicrobesContractInstance = new ethers.Contract(
        config.configVars.erc20.address,
        contractAbi,
        serverWeb3Provider
    );
    for (let i = 0; i < amount; i++) {
        let currentToken = BigNumber.from(await readContractInstance["tokenOfOwnerByIndex"](address, i)).toNumber();
        if (currentToken < 223) {
            goldenMicrobesInWallet[i] = currentToken;
        }
    }
    return goldenMicrobesInWallet
    // for (let i = 0; i < tokensInWallet.length; i++) {
    //     if (await readMicrobesContractInstance["checkIfTokenUsedBefore"](tokensInWallet[i])) {
    //         tokensInWallet[i] = null;
    //     }
    // }
};

export const checkIfTokenIsEligible = async (
    serverWeb3Provider,
    id
): Promise<Boolean> => {
    const contractAbi = Microbes.abi;
    const readMicrobesContractInstance = new ethers.Contract(
        config.configVars.erc20.address,
        contractAbi,
        serverWeb3Provider
    );
    return (await readMicrobesContractInstance["checkIfTokenUsedBefore"](id));
};

export const getIneligibleTokens = async (
    serverWeb3Provider,
    address: string,
    amount
): Promise<String[]> => {
    const contractAbi = Microbes.abi;
    const smContractAbi = SuperTrooprz.abi;
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.superTrooprzAddress,
        smContractAbi,
        serverWeb3Provider
    );
    const readMicrobesContractInstance = new ethers.Contract(
        config.configVars.erc20.address,
        contractAbi,
        serverWeb3Provider
    );
    for (let i = 0; i < amount; i++) {
        ineligibleTokensInWallet[i] = BigNumber.from(await readContractInstance["tokenOfOwnerByIndex"](address, i)).toString();
    }
    for (let i = 0; i < tokensInWallet.length; i++) {
        if (await readMicrobesContractInstance["checkIfTokenUsedBefore"](tokensInWallet[i]) == false) {
            ineligibleTokensInWallet[i] = null;
        }
    }
    return ineligibleTokensInWallet.filter(x => x != null);
};

export const getWriteContractInstance = async (
    browserWeb3Provider: any,
): Promise<ethers.Contract> => {
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.address,
        microbesABI,
        browserWeb3Provider
    );
    const signer = browserWeb3Provider.getSigner();

    return readContractInstance.connect(signer);
};
