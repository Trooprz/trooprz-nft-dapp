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
    const [ineligibleTokensInWallet, setIneligibleTokensInWallet] = useState([]);
    const [usedBefore, setUsedBefore] = useState(false);
    const [idChecked, setIdChecked] = useState(false);

    let claimWallet: any[];


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
        const microbesWriteContractInstance = await utils.getWriteContractInstance(
            state.walletWeb3Modal.provider
        );
        const tx = await microbesWriteContractInstance["claim"](
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

    const claimMaxTenMicrobesPerTurn = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });
        const microbesWriteContractInstance = await utils.getWriteContractInstance(
            state.walletWeb3Modal.provider,
        );
        const firstTenTokensInWallet = tokensInWallet.slice(0, 10);
        tokensInWallet.splice(0, 10)
        const tx = await microbesWriteContractInstance["claimAll"](
            firstTenTokensInWallet
        );
        updateRefreshingAction(dispatch, {
            status: false,
            message: "Complete",
        });
        updateQueryResultsAction(dispatch, {
            ...state.queryResults,
            lastTxHash: tx.hash,
        });
    }

    const claimAllMicrobes = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });
        const microbesWriteContractInstance = await utils.getWriteContractInstance(
            state.walletWeb3Modal.provider,
        );
        if (tokensInWallet.length > 20) {
            for (let i = 0; i < 20; i++) {
                claimWallet[i] = tokensInWallet[i];
                tokensInWallet.splice(i, 1);
            }
            const slicedTokensInWallet = tokensInWallet.slice(0, 19);
        } else {
            claimWallet = tokensInWallet;
        }
        const tx = await microbesWriteContractInstance["claimAll"](
            claimWallet
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
        const microbesWriteContractInstance = await utils.getWriteContractInstance(
            state.walletWeb3Modal.provider,
        );
        const tx = await microbesWriteContractInstance["mint"](amount, {value: cost.mul(amount)});
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
                                    _hover={{bg: '#D6E9CF'}} onClick={claimMaxTenMicrobesPerTurn} disabled={canClaim()}>
                                Claim your miCRObes
                            </Button></Center><br/>
                        <Center>
                            <NumberInput bg='white' width="200px">
                                <NumberInputField id="idToBeChecked" value={id}
                                                  onChange={(e) => setId(e.target.value)}/>
                            </NumberInput><br/><br/>
                        </Center>
                        <Center>
                            <Button size='md'
                                    height='48px'
                                    width='200px'
                                    border='2px'
                                    bg='#C2DCA5'
                                    borderColor='#4E6840'
                                    _hover={{bg: '#D6E9CF'}} onClick={() => {
                                checkIfTokenUsedBefore();
                                setIdChecked(true)
                            }}>Click to check ID</Button>
                            {idChecked && usedBefore &&
                                <p>This SuperTroopr is eligible for claim</p>}
                            {idChecked && !usedBefore &&
                                <p>This SuperTroopr is not eligible for claim</p>}
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
                    <Box w="50%">
                    <Image src="/images/Microbes_Logo_Green.png"/>
                    </Box>
                    <div><br/>
                        <Header/>
                        {state.walletWeb3Modal.connected &&
                            <div>
                                <p>
                                    Welcome!
                                </p>
                                <p>For performance reasons, we limited the amount of SuperTrooprz used per claim to max
                                    10.</p>
                                <p>If you have more, you&lsquo;ll have to claim multiple times. The counter will show
                                    you how many eligible SuperTrooprz you have left.</p><br/>
                                <p>
                                    SuperTrooprz amount: {state.queryResults.erc20Balance}
                                </p>
                                {tokensInWallet && tokensInWallet.length > 0 &&
                                    <p>
                                        Eligible SuperTrooprz left: {tokensInWallet.length}. You can
                                        claim {tokensInWallet.length * 2} miCRObes.
                                    </p>}
                                {tokensInWallet && tokensInWallet.length == 0 &&
                                    <p>You have no eligible SuperTrooprz left (loading this might take a while, hang
                                        tight! Contact us if you think it&lsquo;s not correct.)</p>}
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
