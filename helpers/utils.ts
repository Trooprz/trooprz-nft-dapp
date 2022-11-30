import {BigNumber, ethers} from "ethers";
import * as config from "../config/config";
import Microbes from "../artifacts/Microbes.json";
import SuperTrooprz from "../artifacts/SuperTrooprz.json";
import Trooprz from "../artifacts/Trooprz.json"
import Mutantz from "../artifacts/Mutantz.json"
import {nonEligibleMutantzIds} from "./MutantzStakedSnapshot";
import {nonEligibleSuperTrooprzIds} from "./SuperTrooprzStakedSnapshot";

const microbesAbi = Microbes.abi
const trooprzAbi = Trooprz.abi
const supertrooprzAbi = SuperTrooprz.abi
const mutantzAbi = Mutantz.abi
let tokensInWallet = [];
let ineligibleTokensInWallet = [];
let trooprzInWallet = [];

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



export const getMicrobesBalance = async (
    serverWeb3Provider,
    address: string
): Promise<number> => {
    // Create ethers.Contract object using the smart contract's ABI
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.microbesAddress,
        microbesAbi,
        serverWeb3Provider
    );
    const contractResponse = await readContractInstance["balanceOf"](address);
    // Balance is rounded at 2 decimals instead of 18, to simplify UI
    return (
        ethers.BigNumber.from(contractResponse).toNumber()
    );
};

export const getMutantzBalance = async (
    serverWeb3Provider,
    address: string
): Promise<number> => {
    // Create ethers.Contract object using the smart contract's ABI
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.mutantzAddress,
        mutantzAbi,
        serverWeb3Provider
    );
    const contractResponse = await readContractInstance["balanceOf"](address);
    // Balance is rounded at 2 decimals instead of 18, to simplify UI
    return (
        ethers.BigNumber.from(contractResponse).toNumber()
    );
};

export const getTrooprzBalance = async (
    serverWeb3Provider,
    address: string
): Promise<number> => {
    // Create ethers.Contract object using the smart contract's ABI
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.trooprzAddres,
        trooprzAbi,
        serverWeb3Provider
    );
    const contractResponse = await readContractInstance["balanceOf"](address);
    // Balance is rounded at 2 decimals instead of 18, to simplify UI
    return (
        ethers.BigNumber.from(contractResponse).toNumber()
    );
};

export const getSuperTrooprzBalance = async (
    serverWeb3Provider,
    address: string
): Promise<number> => {
    // Create ethers.Contract object using the smart contract's ABI
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.superTrooprzAddress,
        supertrooprzAbi,
        serverWeb3Provider
    );
    const contractResponse = await readContractInstance["balanceOf"](address);
    // Balance is rounded at 2 decimals instead of 18, to simplify UI
    return (
        ethers.BigNumber.from(contractResponse).toNumber()
    );
};

export const getMicrobesInWallet = async (
    serverWeb3Provider,
    address: string,
    amount
): Promise<String[]> => {
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.microbesAddress,
        microbesAbi,
        serverWeb3Provider
    );
    for (let i = 0; i < amount; i++) {
        tokensInWallet[i] = ethers.BigNumber.from(await readContractInstance["tokenOfOwnerByIndex"](address, i)).toNumber();
    }
    return tokensInWallet;
};

export const getMutantzInWallet = async (
    serverWeb3Provider,
    address: string,
    amount
): Promise<String[]> => {
    let tokenId;
    tokensInWallet = [];
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.mutantzAddress,
        mutantzAbi,
        serverWeb3Provider
    );
    for (let i = 0; i < amount; i++) {
        tokenId = ethers.BigNumber.from(await readContractInstance["tokenOfOwnerByIndex"](address, i)).toNumber();
        if (!nonEligibleMutantzIds.includes(tokenId)) {
            tokensInWallet[i] = tokenId;
        }
    }
    return tokensInWallet;
};

export const getSuperTrooprzInWallet = async (
    serverWeb3Provider,
    address: string,
    amount
): Promise<String[]> => {
    let tokenId;
    tokensInWallet = [];
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.superTrooprzAddress,
        supertrooprzAbi,
        serverWeb3Provider
    );
    for (let i = 0; i < amount; i++) {
        tokenId = ethers.BigNumber.from(await readContractInstance["tokenOfOwnerByIndex"](address, i)).toNumber();
        if (!nonEligibleSuperTrooprzIds.includes(tokenId)) {
            tokensInWallet[i] = tokenId;
        }
    }
    return tokensInWallet;
};

export const checkIfMutantzIsEligible = async (id): Promise<Boolean> => {
    const idToCheck = +id
    return !nonEligibleMutantzIds.includes(idToCheck);
}

export const checkIfSuperTrooprzIsEligible = async (id): Promise<Boolean> => {
    const idToCheck = +id
    return !nonEligibleSuperTrooprzIds.includes(idToCheck);
}

export const checkIfApprovedForAll = async (
    serverWeb3Provider,
    senderAddress: string,
    contractAddress: string
): Promise<Boolean> => {
    const readMicrobesContractInstance = new ethers.Contract(
        config.configVars.erc20.microbesAddress,
        microbesAbi,
        serverWeb3Provider
    );
    return (await readMicrobesContractInstance["isApprovedForAll"](senderAddress, contractAddress));
};

export const getOGTrooprzInWallet = async (
    serverWeb3Provider,
    address: string,
    amount
): Promise<String[]> => {
    const readTrooprzContractInstance = new ethers.Contract(
        config.configVars.erc20.trooprzAddres,
        trooprzAbi,
        serverWeb3Provider
    );
    const readMutantzContractInstance = new ethers.Contract(
        config.configVars.erc20.address,
        mutantzAbi,
        serverWeb3Provider
    )
    for (let i = 0; i < amount; i++) {
        trooprzInWallet[i] = ethers.BigNumber.from(await readTrooprzContractInstance["tokenOfOwnerByIndex"](address, i)).toNumber();
    }
    for (let i = 0; i < trooprzInWallet.length; i++) {
        if (await readMutantzContractInstance["checkIfOGTrooprUsedBefore"]([trooprzInWallet[i]]) == true) {
            trooprzInWallet[i] = null;
        }
    }
    return trooprzInWallet.filter(x => x != null);
}

export const checkIfTokenIsEligible = async (
    serverWeb3Provider,
    id
): Promise<Boolean> => {
    const readMutantzContractInstance = new ethers.Contract(
        config.configVars.erc20.address,
        mutantzAbi,
        serverWeb3Provider
    );
    let isUsed = false;
    id = ethers.BigNumber.from(id).toNumber();
    if (await readMutantzContractInstance["checkIfOGTrooprUsedBefore"]([id]) == true) {
        isUsed = true;
        // break;
    } else if (await readMutantzContractInstance["checkIfOGTrooprUsedBefore"]([id]) == false) {
        isUsed = false;
    }
    return isUsed;
};

export const getIneligibleTokens = async (
    serverWeb3Provider,
    address: string,
    amount
): Promise<String[]> => {
    const contractAbi = Microbes.abi;
    const smContractAbi = SuperTrooprz.abi;
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.microbesAddress,
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

export const getMutantzWriteContractInstance = async (
    browserWeb3Provider: any,
): Promise<ethers.Contract> => {
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.mutantzAddress,
        mutantzAbi,
        browserWeb3Provider
    );
    const signer = browserWeb3Provider.getSigner();

    return readContractInstance.connect(signer);
};

export const getSuperTrooprzWriteContractInstance = async (
    browserWeb3Provider: any,
): Promise<ethers.Contract> => {
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.superTrooprzAddress,
        supertrooprzAbi,
        browserWeb3Provider
    );
    const signer = browserWeb3Provider.getSigner();

    return readContractInstance.connect(signer);
};
