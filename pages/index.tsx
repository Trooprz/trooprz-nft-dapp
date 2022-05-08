import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React, {useEffect, useState} from "react";
import {Store} from "../store/store-reducer";
import {updateQueryResultsAction, updateRefreshingAction} from "../store/actions";
import {Box, Image} from '@chakra-ui/react';
import * as utils from "../helpers/utils";
import {BigNumber} from "ethers";
import {
    Button, Center,
    NumberInput,
    NumberInputField,
} from "@chakra-ui/react";
import Header from "./mint/Header";
import {checkIfTokenIsEligible} from "../helpers/utils";

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
    const [usedBefore, setUsedBefore] = useState(false);
    const [idChecked, setIdChecked] = useState(false);


    useEffect(() => {
        const fetchAmountOfTokensInWallet = async () => {
            const data = await utils.getEligibleTokens(state.walletWeb3Modal.provider, state.walletWeb3Modal.address, state.queryResults.erc20Balance);
            setTokensInWallet(data);
        }
        fetchAmountOfTokensInWallet().catch(console.error);

        const fetchIneligibleTokensInWallet = async () => {
            const data = await utils.getIneligibleTokens(state.walletWeb3Modal.provider, state.walletWeb3Modal.address, state.queryResults.erc20Balance);
            setIneligibleTokensInWallet(data);
        }
        fetchIneligibleTokensInWallet().catch(console.error);
    }, [state.queryResults.erc20Balance])

    const claimMicrobe = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });
        const bacteriaWriteContractInstance = await utils.getWriteContractInstance(
            state.walletWeb3Modal.provider
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
            state.walletWeb3Modal.provider,
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
            state.walletWeb3Modal.provider,
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

    const canClaim = () => {
        if (tokensInWallet.length == 0) {
            return true;
        }
    };

    const checkIfTokenUsedBefore = () => {
        if (checkIfTokenIsEligible(state.walletWeb3Modal.provider, state.walletWeb3Modal.address, BigNumber.from(id))) {
            setUsedBefore(false);
        }
        setUsedBefore(true);
    }

    const renderActionButtons = () => {
        if (state.walletWeb3Modal.connected) {
            return (
                    <div>
                        <Center>
                        <Button size='md'
                                height='48px'
                                width='200px'
                                border='2px'
                                bg='#C2DCA5'
                                borderColor='#4E6840'
                                _hover={{ bg: '#D6E9CF' }}onClick={claimAllMicrobes} disabled={canClaim()}>
                            Claim your miCRObes
                        </Button></Center><br/>
                        <NumberInput bg='white' defaultValue={"Enter the id you want to check"}>
                            <NumberInputField id="idToBeChecked" value={id} onChange={(e) => setId(e.target.value)}/>
                        </NumberInput><br/>
                        <Center>
                        <Button size='md'
                                height='48px'
                                width='200px'
                                border='2px'
                                bg='#C2DCA5'
                                borderColor='#4E6840'
                                _hover={{ bg: '#D6E9CF' }} onClick={() => {checkIfTokenUsedBefore(); setIdChecked(true)}}>Click to check ID</Button>
                        {idChecked && usedBefore &&
                        <p>This token is eligible for claim</p>}
                        {idChecked && !usedBefore &&
                            <p>This token is not eligible for claim</p>}
                        </Center>

                    </div>
            )
                ;
        } else {
            return null;
        }
    };

    return (
        <>
            <div className={'image-container'}>
                <Head>
                    <title>Troopz dApp</title>
                    <meta name="description" content="Troopz dApp"/>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>
                <main className={styles.main}>
                    <Image src="/images/Microbes_Logo_Green.png"/>
                    <div><br/>
                        <Header/>
                        {state.walletWeb3Modal.connected &&
                            <div>
                                <p>
                                    Welcome!
                                </p>
                                <p>
                                    Cronos address:{" "}
                                    {state.walletWeb3Modal.address ? state.walletWeb3Modal.address : "Not connected"}
                                </p>
                                <p>
                                    Balance: {state.queryResults.croBalance} CRO
                                </p>
                                <p>
                                    SuperTroopr token balance: {state.queryResults.erc20Balance}
                                </p>
                                {tokensInWallet && tokensInWallet.length > 0 &&
                                    <p>
                                        Eligible SuperTrooprz left: {tokensInWallet.length}. You can
                                        claim {tokensInWallet.length * 2} miCRObes.
                                    </p>}
                                {tokensInWallet && tokensInWallet.length == 0 &&
                                    <p>You have no eligible SuperTrooprz left</p>}
                                {renderActionButtons()}

                            </div>}
                    </div>
                </main>
            </div>
            <div>
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
        </>
    );
}
export default Home;
