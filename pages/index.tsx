import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React, {useEffect, useState} from "react";
import {Store} from "../store/store-reducer";
import {updateQueryResultsAction, updateRefreshingAction} from "../store/actions";
import Link from "next/link";
import { Image } from '@chakra-ui/react'


import * as config from "../config/config";
import * as utils from "../helpers/utils";
import {BigNumber} from "ethers";
import {
    Button, Center,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper, Spinner
} from "@chakra-ui/react";
import Header from "./mint/Header";

interface IProps {
}

const Home: React.FC<IProps> = () => {
    const {state, dispatch} = React.useContext(Store);
    const [amount, setAmount] = useState('');
    const cost = BigNumber.from("5000000000000000000");
    const [tokensInWallet, setTokensInWallet] = useState([]);
    const [id, setId] = useState('');
    const [claim, setClaim] = useState(false);
    const [mint, setMint] = useState(false);
    const [showTrooprz, setShowTrooprz] = useState(false);
    const [ineligibleTokensInWallet, setIneligibleTokensInWallet] = useState([]);

    useEffect(() => {
        const fetchAmountOfTokensInWallet = async () => {
            const data = await utils.getTokens(state.wallet.browserWeb3Provider, state.wallet.address, state.queryResults.erc20Balance);
            setTokensInWallet(data);
        }
        fetchAmountOfTokensInWallet().catch(console.error);

        const fetchIneligibleTokensInWallet = async () => {
            const data = await utils.getIneligibleTokens(state.wallet.browserWeb3Provider, state.wallet.address, state.queryResults.erc20Balance);
            setIneligibleTokensInWallet(data);
        }
        fetchIneligibleTokensInWallet().catch(console.error);
    }, [showTrooprz])


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

    const claimAllMicrobes = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });
        const bacteriaWriteContractInstance = await utils.getWriteContractInstance(
            state.wallet.browserWeb3Provider
        );
        const tx = await bacteriaWriteContractInstance["claimAll"](
            tokensInWallet
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

    const renderActionButtons = () => {
        if (state.wallet.connected) {
            return (
                <div>
                <div>
                    <Button onClick={result => {
                        setClaim(true);
                        setMint(false)
                    }}>
                        I want to claim miCRObes
                    </Button>{' '}
                    <Button onClick={result => {
                        setMint(true);
                        setClaim(false)
                    }}>
                        I want to mint miCRObes
                    </Button>
                </div><br/>
                <div>
                    {claim &&
                        <><Button onClick={claimMicrobe}>
                            Claim 2 miCRObes per SuperTroopr
                        </Button>{' '}<Button onClick={claimAllMicrobes}>
                            Claim all your miCRObes
                        </Button>{' '}</>
                    }
                    {mint &&
                        <><NumberInput defaultValue={1} min={1} max={10}>
                            <NumberInputField id="amountOfTokensToBeMinted" value={amount}
                                              onChange={(e) => setAmount(e.target.value)}/>
                            <NumberInputStepper>
                                <NumberIncrementStepper/>
                                <NumberDecrementStepper/>
                            </NumberInputStepper>
                        </NumberInput><br/>
                            <Button onClick={mintMicrobe}>
                            Mint Bacteria for CRO
                        </Button></>
                    }
                </div>
                </div>
            );
        } else {
            return null;
        }
    };

    const renderOwnedSuperTrooprz = () => {
        if (state.wallet.connected) {
            if (tokensInWallet && tokensInWallet.length == 0 && showTrooprz && ineligibleTokensInWallet && ineligibleTokensInWallet.length == 0) {
                return <Center>
                    <Spinner/>
                </Center>
            }
            if (claim && tokensInWallet && tokensInWallet.length > 0) {
                return (
                    <p>You have {tokensInWallet.length} eligible tokens in your wallet</p>
                    // <SimpleGrid
                    //     bg='gray.50'
                    //     columns={{sm: 2, md: 4}}
                    //     spacing='8'
                    //     p='10'
                    //     textAlign='center'
                    //     rounded='lg'
                    //     color='gray.400'>
                    //     {
                    //         tokensInWallet.map((item) => <div key={item}
                    //                                           onClick={() => {
                    //                                               setId(item)
                    //                                           }}><Image
                    //             key={item}
                    //             width='150'
                    //             height='150'
                    //             src={"https://ipfs.io/ipfs/bafybeigokmkefpxuco3f4demdre3rnuixvrkcgru6cxosyo3eat5xbelem/" + item + ".png"}
                    //         /></div>)
                    //     }
                    // </SimpleGrid>
                );
            }
        } else return "not connected";
    }

    const renderIneligibleSuperTrooprz = () => {
        if (state.wallet.connected) {
            if (ineligibleTokensInWallet && ineligibleTokensInWallet.length > 0) {
                return (
                    <p>You have {ineligibleTokensInWallet.length} in your wallet</p>
                    // <SimpleGrid
                    //     bg='gray.50'
                    //     columns={{sm: 2, md: 4}}
                    //     spacing='8'
                    //     p='10'
                    //     textAlign='center'
                    //     rounded='lg'
                    //     color='gray.400'>
                    //     {
                    //         ineligibleTokensInWallet.map((item) => <div key={item}
                    //                                           onClick={() => {
                    //                                               setId(item)
                    //                                           }}><Image className="grayscale"
                    //             boxSize="50px"
                    //             key={item}
                    //             width='150'
                    //             height='150'
                    //             src={"https://ipfs.io/ipfs/bafybeigokmkefpxuco3f4demdre3rnuixvrkcgru6cxosyo3eat5xbelem/" + item + ".png"}
                    //         /></div>)
                    //     }
                    // </SimpleGrid>
                );
            }
        } else return "not connected";
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
        <div className={'image-container'}>
            <Head>
                <title>Troopz dApp</title>
                <meta name="description" content="Troopz dApp"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <Center>
                <main className={styles.main}>
                    <Image src="/images/header-graphic.png" />
                    <h1 className={styles.title}>
                        The Trooprz minting platform!
                    </h1>
                    <div><br/>
                        <Header/>
                        {state.wallet.connected &&
                            <div>
                                <p>
                                    Welcome!
                                </p>
                                <p>
                                    Cronos address:{" "}
                                    {state.wallet.address ? state.wallet.address : "Not connected"}
                                </p>
                                <p>
                                    Wallet provider:{" "}
                                    {state.wallet.walletProviderName
                                        ? state.wallet.walletProviderName
                                        : "Not connected"}
                                </p>
                                <p>
                                    Balance: {state.queryResults.croBalance}
                                </p>
                                <p>
                                    SuperTroopr token balance: {state.queryResults.erc20Balance}
                                </p>
                                {renderActionButtons()}
                                {renderOwnedSuperTrooprz()}
                                {renderIneligibleSuperTrooprz()}
                            </div>
                        }
                    </div>


                </main>
            </Center>

            <footer className={styles.footer}>
                <a
                    href="https://trooprz.army"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Powered by{' '}
                    <span className={styles.logo}>
            <Image src="/images/trooprz-logo.svg" alt="Trooprz Logo" width={180} height={55}/>
          </span>
                </a>
            </footer>
        </div>
    );
}
export default Home;