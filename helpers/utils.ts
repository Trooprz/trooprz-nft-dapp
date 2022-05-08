// helper/utils.ts
import {BigNumber, ethers} from "ethers"; // npm install ethers
import * as config from "../config/config";
import Virus from "../artifacts/Virus.json";
import SuperTrooprz from "../artifacts/SuperTrooprz.json";

// NOTE: Make sure to change this to the contract address you deployed
const virusAddress = '0xb086E2De2893b1e5d9b9A0b4F028dEfdaa2fE393'
// ABI so the web3 library knows how to interact with our contract
const virusABI = Virus.abi
let tokensInWallet = [];
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

// Get the amount of Virus of address
export const getTokenBalance = async (
    serverWeb3Provider,
): Promise<number> => {
    const contract = new ethers.Contract(
        virusAddress,
        virusABI,
        serverWeb3Provider
    )
    await serverWeb3Provider.send("eth_requestAccounts", []);
    const signer = serverWeb3Provider.getSigner();
    const address = await signer.getAddress();
    const contractWithSigner = contract.connect(signer);
    return await contractWithSigner.balanceOf(address);
}

// Get the Virus token balance of address
// This is a ERC20 smart contract, its address is retrieved from
// the config/config.ts file
// and the ABI from config/contracts/Virus.json
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

export const getEligibleTokens = async (
    serverWeb3Provider,
    address: string,
    amount
): Promise<String[]> => {
    const contractAbi = Virus.abi;
    const smContractAbi = SuperTrooprz.abi;
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.superTrooprzAddress,
        smContractAbi,
        serverWeb3Provider
    );
    const readVirusContractInstance = new ethers.Contract(
        config.configVars.erc20.address,
        contractAbi,
        serverWeb3Provider
    );
    for (let i = 0; i < amount; i++) {
        tokensInWallet[i] = BigNumber.from(await readContractInstance["tokenOfOwnerByIndex"](address, i)).toString();
        console.log(tokensInWallet[i]);
    }
    console.log(tokensInWallet.length);
    for (let i = 0; i < tokensInWallet.length; i++) {
        if (await readVirusContractInstance["checkIfTokenUsedBefore"](tokensInWallet[i])) {
            tokensInWallet[i] = null;
        }
    }
    console.log(tokensInWallet);
    let filtered = tokensInWallet.filter(x => x != null);
    console.log(filtered);
    return filtered;
};

export const checkIfTokenIsEligible = async (
    serverWeb3Provider,
    address: string,
    id
): Promise<Boolean> => {
    const contractAbi = Virus.abi;
    const readVirusContractInstance = new ethers.Contract(
        config.configVars.erc20.address,
        contractAbi,
        serverWeb3Provider
    );
    return !!(await readVirusContractInstance["checkIfTokenUsedBefore"](id));
};

export const getIneligibleTokens = async (
    serverWeb3Provider,
    address: string,
    amount
): Promise<String[]> => {
    const contractAbi = Virus.abi;
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
    let filtered = ineligibleTokensInWallet.filter(x => x != null);
    console.log(filtered);
    return filtered;
};

// Generate a ethers.Contract instance of the contract object
// together with a signer that will trigger a transaction
// approval in the wallet whenever it is called by the Dapp
export const getWriteContractInstance = async (
    browserWeb3Provider: any,
): Promise<ethers.Contract> => {
    // Create ethers.Contract object using the smart contract's ABI
    const readContractInstance = new ethers.Contract(
        config.configVars.erc20.address,
        virusABI,
        browserWeb3Provider
    );
    console.log(browserWeb3Provider)
    const signer = browserWeb3Provider.getSigner();

    // Add a signer to make the ethers.Contract object able
    // to craft transactions
    return readContractInstance.connect(signer);
};
