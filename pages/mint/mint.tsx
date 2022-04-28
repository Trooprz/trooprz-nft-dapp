import React, {useEffect, useState} from "react";
import {Store} from "../../store/store-reducer";
import {updateQueryResultsAction, updateRefreshingAction} from "../../store/actions";
import Link from "next/link";

import * as config from "../../config/config";
import * as utils from "../../helpers/utils";
import Header from "./Header";
import {BigNumber} from "ethers";
import Image from "next/image";

interface IProps {
}

const Mint: React.FC<IProps> = () => {
    const {state, dispatch} = React.useContext(Store);
    const [provider, setProvider] = useState()
    const [amount, setAmount] = useState('');
    const cost = BigNumber.from("5000000000000000000");
    const [tokensInWallet, setTokensInWallet] = useState([]);
    const [id, setId] = useState('');

    const fetchAmountOfTokensInWallet = async () => {
        return await utils.getTokens(state.wallet.browserWeb3Provider, state.wallet.address, state.queryResults.erc20Balance);
    }

    const claimMicrobe = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });
        const bacteriaWriteContractInstance = await utils.getWriteContractInstance(
            state.wallet.browserWeb3Provider
        );
        const tx = await bacteriaWriteContractInstance["claim"](
            id
        );
        updateRefreshingAction(dispatch, {
            status: false,
            message: "Complete",
        });
        updateQueryResultsAction(dispatch, {
            ...state.queryResults,
            lastTxHash: tx.hash,
        });
    };

    const mintMicrobe = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });
        const bacteriaWriteContractInstance = await utils.getWriteContractInstance(
            state.wallet.browserWeb3Provider
        );
        const tx = await bacteriaWriteContractInstance["mint"](amount, {value: cost.mul(amount)});
        updateRefreshingAction(dispatch, {
            status: false,
            message: "Complete",
        });
        updateQueryResultsAction(dispatch, {
            ...state.queryResults,
            lastTxHash: tx.hash,
        });
    };

    const renderLastTransaction = () => {
        if (state.queryResults.lastTxHash) {
            return (
                <div>
                    <p>
                        Last transaction:{" "}
                        <Link
                            href={
                                config.configVars.rpcNetwork.blockExplorerUrl +
                                "tx/" +
                                state.queryResults.lastTxHash
                            }
                        >
                            <a target="_blank"
                               rel="noopener"
                               color="inherit"> View in block explorer</a>
                        </Link>
                    </p>
                </div>
            );
        }
    };

    const renderActionButtons = () => {
        if (state.wallet.connected) {
            return (
                <div>
                    <button onClick={claimMicrobe}>
                        Claim 2 Bacteria per SuperTroopr
                    </button>
                    <input id="amountOfTokensToBeMinted" value={amount} onChange={(e) => setAmount(e.target.value)}/>
                    <button onClick={mintMicrobe}>
                        Mint 1 Bacteria for some tCRO
                    </button>
                </div>
            );
        } else {
            return null;
        }
    };

    const renderOwnedSuperTrooprz = () => {
        if (state.wallet.address) {
            fetchAmountOfTokensInWallet().then(result => setTokensInWallet(result));
            return (
                <div>
                    {
                        tokensInWallet && tokensInWallet.length > 0 && tokensInWallet.map((item) => <div key={item} onClick={() => { setId(item) }}><Image key={item}
                                                                                                           width='150'
                                                                                                           height='150'
                                                                                                           src={"https://ipfs.io/ipfs/bafybeigokmkefpxuco3f4demdre3rnuixvrkcgru6cxosyo3eat5xbelem/" + item + ".png"}
                        /></div>)
                    }
                </div>
            );
        }
        else return 'not connected';
    }

    // This is used to display more details about the Redux state on the web page, for debugging purposes
    // You can activate by changing the mode to "debug" in config/config.ts
    const renderDebugInfo = () => {
        if (config.configVars.mode === "debug") {
            return (
                <p>
                    Debug info:{" "}
                    {JSON.stringify({
                        walletProviderName: state.wallet.walletProviderName,
                        address: state.wallet.address,
                        chainId: state.wallet.chaindId,
                        connected: state.wallet.connected,
                        ...state.queryResults,
                    })}
                </p>
            );
        } else {
            return null;
        }
    };

    return (
        <div>
            <Header/>
            <div>
                <p>
                    Welcome
                </p>
                <p>
                    Cronos address:{" "}
                    {state.wallet.address ? state.wallet.address : "Not connected"}
                </p>
                <p>
                    Chain ID:{" "}
                    {state.wallet.chainId ? state.wallet.chainId : "Not connected"}
                </p>
                <p>
                    Wallet provider:{" "}
                    {state.wallet.walletProviderName
                        ? state.wallet.walletProviderName
                        : "Not connected"}
                </p>
                <p>
                    Last block number:{" "}
                    {state.queryResults.lastBlockNumber
                        ? state.queryResults.lastBlockNumber
                        : "Not connected"}
                </p>
                <p>
                    tCRO balance: {state.queryResults.croBalance}
                </p>
                <p>
                    SuperTroopr token balance: {state.queryResults.erc20Balance}
                </p>
                {renderLastTransaction()}
                {renderActionButtons()}
                {renderDebugInfo()}
                {renderOwnedSuperTrooprz()}
            </div>
        </div>
    );
};
export default Mint;
