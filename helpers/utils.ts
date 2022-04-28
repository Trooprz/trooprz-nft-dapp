// helper/utils.ts
import {BigNumber, ethers} from "ethers"; // npm install ethers
import * as config from "../config/config";
import Bacteria from "../artifacts/Bacteria.json";
import SuperMonkehz from "../artifacts/Monkehz.json";

// NOTE: Make sure to change this to the contract address you deployed
const bacteriaAddress = '0x4b37C6053Dd6D2389A7A4eE0E50c95913bC028c0'
// ABI so the web3 library knows how to interact with our contract
const bacteriaABI = Bacteria.abi
let tokensInWallet = [];

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const hexToInt = (s: string) => {
  const bn = ethers.BigNumber.from(s);
  return parseInt(bn.toString());
};

export const reloadApp = () => {
  window.location.reload();
};

// Get the last block number
export const getLastBlockNumber = async (ethersProvider: any): Promise<any> => {
  return ethersProvider.getBlockNumber();
};

// Get the CRO balance of address
export const getCroBalance = async (
  serverWeb3Provider: ethers.providers.JsonRpcProvider,
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

// Get the amount of Bacteria of address
export const getTokenBalance = async (
    serverWeb3Provider: ethers.providers.JsonRpcProvider,
): Promise<number> => {
  const contract = new ethers.Contract(
      bacteriaAddress,
      bacteriaABI,
      serverWeb3Provider
  )
  await serverWeb3Provider.send("eth_requestAccounts", []);
  const signer = serverWeb3Provider.getSigner();
  const address = await signer.getAddress();
  const contractWithSigner = contract.connect(signer);
  return await contractWithSigner.balanceOf(address);
}

// Get the Bacteria token balance of address
// This is a ERC20 smart contract, its address is retrieved from
// the config/config.ts file
// and the ABI from config/contracts/Bacteria.json
export const getBalance = async (
  serverWeb3Provider: ethers.providers.JsonRpcProvider,
  address: string
): Promise<number> => {
  // Create ethers.Contract object using the smart contract's ABI
  const contractAbi = SuperMonkehz.abi;
  const readContractInstance = new ethers.Contract(
    config.configVars.erc20.superMonkehzAddress,
    contractAbi,
    serverWeb3Provider
  );
  const contractResponse = await readContractInstance["balanceOf"](address);
  // Balance is rounded at 2 decimals instead of 18, to simplify UI
  return (
    ethers.BigNumber.from(contractResponse).toNumber()
  );
};

export const getTokens = async (
    serverWeb3Provider: ethers.providers.JsonRpcProvider,
    address: string,
    amount
): Promise<String[]> => {
  const contractAbi = SuperMonkehz.abi;
  const readContractInstance = new ethers.Contract(
      config.configVars.erc20.superMonkehzAddress,
      contractAbi,
      serverWeb3Provider
  );
  console.log("The amount is: " + amount);
  for (let i = 0; i < amount; i++) {
    tokensInWallet[i] = BigNumber.from(await readContractInstance["tokenOfOwnerByIndex"](address, i)).toString();
    console.log("In my wallet: " + tokensInWallet);
    console.log("Counter: " + i);
  }
  return tokensInWallet;
}

// Generate a ethers.Contract instance of the contract object
// together with a signer that will trigger a transaction
// approval in the wallet whenever it is called by the Dapp
export const getWriteContractInstance = async (
  browserWeb3Provider: any
): Promise<ethers.Contract> => {
  const ethersProvider = browserWeb3Provider;
  // Create ethers.Contract object using the smart contract's ABI
  const readContractInstance = new ethers.Contract(
    config.configVars.erc20.address,
    bacteriaABI,
    ethersProvider
  );
  // Add a signer to make the ethers.Contract object able
  // to craft transactions
  const fromSigner = ethersProvider.getSigner();
  return readContractInstance.connect(fromSigner);
};
