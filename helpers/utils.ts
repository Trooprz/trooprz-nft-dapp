import {BigNumber, ethers} from "ethers";
import * as config from "../config/config";
import Microbes from "../artifacts/Microbes.json";
import Rings from "../artifacts/Rings.json";
import SuperTrooprz from "../artifacts/SuperTrooprz.json";
import Trooprz from "../artifacts/Trooprz.json"
import Mutantz from "../artifacts/Mutantz.json"
import {nonEligibleMutantzIds} from "./MutantzStakedSnapshot";
import {nonEligibleSuperTrooprzIds} from "./SuperTrooprzStakedSnapshot";

const microbesAbi = Microbes.abi
const trooprzAbi = Trooprz.abi
const supertrooprzAbi = SuperTrooprz.abi
const mutantzAbi = Mutantz.abi
const ringsAbi = Rings.abi
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
export const getRingsBalance = async (
    serverWeb3Provider,
    address: string
): Promise<number> => {
    // Create ethers.Contract object using the smart contract's ABI
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.ringsAddress,
        ringsAbi,
        serverWeb3Provider
    );
    const contractResponse = await readContractInstance["balanceOf"](address);
    // Balance is rounded at 2 decimals instead of 18, to simplify UI
    return (
        ethers.BigNumber.from(contractResponse).toNumber()
    );
};

export const getRingsInWallet = async (
    serverWeb3Provider,
    address: string,
    amount,
    color
): Promise<String[]> => {
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.ringsAddress,
        ringsAbi,
        serverWeb3Provider
    );
    for (let i = 0; i < amount; i++) {
        let tokenId;
        if (color === 'obsidian') {
            tokenId = ethers.BigNumber.from(await readContractInstance["tokenOfOwnerByIndex"](address, i)).toNumber();
            if (tokenId >= 1 && tokenId <= 111) {
                tokensInWallet[i] = tokenId
                break;
            }
        } else if (color === 'icyWhite') {
            tokenId = ethers.BigNumber.from(await readContractInstance["tokenOfOwnerByIndex"](address, i)).toNumber();
            if (tokenId >= 112 && tokenId <= 222) {
                tokensInWallet[i] = tokenId
                break;
            }
        } else if (color === 'roseGold') {
            tokenId = ethers.BigNumber.from(await readContractInstance["tokenOfOwnerByIndex"](address, i)).toNumber();
            if (tokenId >= 223 && tokenId <= 333) {
                tokensInWallet[i] = tokenId
                break;
            }
        } else if (color === 'royalIndigo') {
            tokenId = ethers.BigNumber.from(await readContractInstance["tokenOfOwnerByIndex"](address, i)).toNumber();
            if (tokenId >= 334 && tokenId <= 444) {
                tokensInWallet[i] = tokenId
                break;
            }
        } else if (color === 'jadeGreen') {
            tokenId = ethers.BigNumber.from(await readContractInstance["tokenOfOwnerByIndex"](address, i)).toNumber();
            if (tokenId >= 445 && tokenId <= 555) {
                tokensInWallet[i] = tokenId
                break;
            }
        } else if (color === 'rubyRed') {
            tokenId = ethers.BigNumber.from(await readContractInstance["tokenOfOwnerByIndex"](address, i)).toNumber();
            if (tokenId >= 556 && tokenId <= 666) {
                tokensInWallet[i] = tokenId
                break;
            }
        } else if (color === 'midnightBlue') {
            tokenId = ethers.BigNumber.from(await readContractInstance["tokenOfOwnerByIndex"](address, i)).toNumber();
            if (tokenId >= 667 && tokenId <= 777) {
                tokensInWallet[i] = tokenId
                break;
            }
        }
    }
    return tokensInWallet;
};

// 1 - 111 = Obsidian
// 112 - 222 = Icy White
// 223 - 333 = Rose Gold
// 334 - 444 = Royal Indigo
// 445 - 555 = Jade Green
// 556 - 666 = Ruby Red
// 667 - 777 = Midnight Blue

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

export const getRingsWriteContractInstance = async (
    browserWeb3Provider: any,
): Promise<ethers.Contract> => {
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.ringsAddress,
        ringsAbi,
        browserWeb3Provider
    );
    const signer = browserWeb3Provider.getSigner();

    return readContractInstance.connect(signer);
};
