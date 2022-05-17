import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React, {useEffect, useState} from "react";
import {Store} from "../store/store-reducer";
import {updateQueryResultsAction, updateRefreshingAction, updateWalletWeb3ModalAction} from "../store/actions";
import {Box, Image, ListItem, Text, UnorderedList, VStack} from '@chakra-ui/react';
import * as utils from "../helpers/utils";
import {BigNumber} from "ethers";
import {
    Button, Center,
    NumberInput,
    NumberInputField,
} from "@chakra-ui/react";
import Header from "./mint/Header";
import {checkIfTokenIsEligible, getTotalSupplyLeft} from "../helpers/utils";
import {defaultQueryResults, defaultWalletWeb3Modal} from "../store/interfaces";
import Web3Modal from "web3modal";
import providerOptions from "../config/ProviderOptions";
import Link from "next/link";

interface IProps {
}

const Home: React.FC<IProps> = () => {
    const {state, dispatch} = React.useContext(Store);
    const [amount, setAmount] = useState('');
    const cost = BigNumber.from("99000000000000000000");
    const [tokensInWallet, setTokensInWallet] = useState([]);
    const [id, setId] = useState('');
    const [ineligibleTokensInWallet, setIneligibleTokensInWallet] = useState([]);
    const [isEligible, setIsEligible] = useState(Boolean);
    const [show, setShow] = useState(false);
    const [minted, setMinted] = useState(false);
    const [actualPrice, setActualPrice] = useState(0);
    let claimWallet: any[];
    let web3Modal;

    if (typeof window !== 'undefined') {
        web3Modal = new Web3Modal({
            providerOptions
        })
    }


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

    const canMint = () => {
        return true;
    }

    const isTokenEligible = async () => {
        if (await checkIfTokenIsEligible(state.walletWeb3Modal.provider, id)) {
            setIsEligible(true);
        } else {
            setIsEligible(false);
        }
    }


    const renderActionButtons = () => {
        if (state.walletWeb3Modal.connected) {
            return (
                <div>
                    <Center>
                        <Button size='md'
                                height='48px'
                                width='220px'
                                border='2px'
                                bg='#C2DCA5'
                                borderColor='#4E6840'
                                _hover={{bg: '#D6E9CF'}} onClick={claimMaxTenMicrobesPerTurn} disabled={canClaim()}>
                            Claim your miCRObes
                        </Button></Center><br/>

                </div>
            )
                ;
        } else {
            return null;
        }
    };

    const disconnectWallet = async () => {
        setTokensInWallet([]);
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Disconnecting wallet...",
        });
        updateRefreshingAction(dispatch, {
            status: false,
            message: "Complete",
        });
        updateWalletWeb3ModalAction(dispatch, {...defaultWalletWeb3Modal});
        updateQueryResultsAction(dispatch, {...defaultQueryResults});
        web3Modal.clearCachedProvider();
    };

    return (
        <>
            <div className={'image-container'}>
                <Head>
                    <title>Troopz dApp</title>
                    <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate"/>
                    <meta httpEquiv="Pragma" content="no-cache"/>
                    <meta httpEquiv="Expires" content="0"/>
                    <meta name="description" content="Troopz dApp"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>
                <main className={styles.main}>
                    <Center>
                        <VStack spacing='24px' width='100%'>
                            <Box w="60%">
                                <Image src="/images/Microbes_Logo_Green.png"/>
                            </Box>
                            <Header/>
                            {state.walletWeb3Modal.connected &&
                                <Box w="75%" borderBottom='1px solid' borderColor='#4E6840' borderStyle='dashed'>


                                    <><Center><Text fontSize="5xl">
                                        Pew! Pew! Pew!
                                    </Text></Center>
                                        <Center>
                                            <UnorderedList>
                                                {/*<ListItem>*/}
                                                {/*    Press &lsquo;Mint your miCRObes&lsquo; to mint*/}
                                                {/*</ListItem>*/}
                                                {/*<ListItem>*/}
                                                {/*    The system will tell you how many miCRObes you have left to claim*/}
                                                {/*</ListItem>*/}
                                                {/*<ListItem>*/}
                                                {/*    You can claim 20 miCRObes per transaction (performance optimisation)*/}
                                                {/*</ListItem>*/}
                                                {/*<ListItem>*/}
                                                {/*    Example: If you have 34 miCRObes to claim, you will need to do 2*/}
                                                {/*    separate claim transactions: 20 and 14*/}
                                                {/*</ListItem>*/}
                                                {/*<ListItem>*/}
                                                {/*    The system will handle the number each time you claim and increment*/}
                                                {/*    your &lsquo;Total No. of Eligible Super Trooprz&lsquo; and*/}
                                                {/*    your &lsquo;Total No. of miCRObes left to claim&lsquo; each time*/}
                                                {/*</ListItem>*/}
                                                {/*<ListItem>*/}
                                                {/*    You can use the &lsquo;Eligibility Check&lsquo; function to check if*/}
                                                {/*    a*/}
                                                {/*    Super Trooprz ID has claimed miCRObes already (before you buy!)*/}
                                                {/*</ListItem>*/}
                                                {/*<ListItem>*/}
                                                {/*    Don&lsquo;t forget to disconnect your wallet - Safety First!*/}
                                                {/*</ListItem><br/>*/}
                                                <ListItem>Claim has ended!</ListItem>
                                                <ListItem>Mint will become active 17/05/2022 at 13pm BST</ListItem>
                                                <ListItem>Don&lsquo;t forget you will need 1 OG Trooprz + 4 miCRObes to
                                                    SPAWN Mutantz</ListItem>
                                                <ListItem><Link
                                                    href="https://app.ebisusbay.com/collection/trooprz">https://app.ebisusbay.com/collection/trooprz</Link></ListItem>
                                            </UnorderedList></Center>
                                    </>

                                </Box>}
                            {/*{state.walletWeb3Modal.connected &&*/}
                            {/*    <Box w="75%" borderBottom='1px solid' borderColor='#4E6840' borderStyle='dashed'>*/}
                            {/*        {state.walletWeb3Modal.connected && tokensInWallet.length == 0 &&*/}
                            {/*            <Center><Text fontWeight='bold' color='red'>Please be patient while we load your*/}
                            {/*                miCRObes - this may take a few minutes for large numbers</Text></Center>}*/}
                            {/*        {state.walletWeb3Modal.connected &&*/}
                            {/*            <Center><Text fontWeight='bold'>*/}
                            {/*                TOTAL NO. OF SUPER TROOPRZ: {state.queryResults.erc20Balance}*/}
                            {/*            </Text></Center>}*/}
                            {/*        {state.walletWeb3Modal.connected && tokensInWallet && tokensInWallet.length >= 0 &&*/}
                            {/*            <><Center><Text fontWeight='bold'>*/}
                            {/*                TOTAL NO. OF ELIGIBLE SUPER TROOPRZ: {tokensInWallet.length}*/}
                            {/*            </Text></Center>*/}
                            {/*                <Center><Text fontWeight='bold'>TOTAL NO. OF MICROBES LEFT TO*/}
                            {/*                    CLAIM: {tokensInWallet.length * 2}</Text></Center><br/></>*/}
                            {/*        }*/}
                            {/*        {renderActionButtons()}*/}
                            {/*    </Box>}*/}
                            {state.walletWeb3Modal.connected &&
                                <Box>
                                    <Center>
                                        <NumberInput bg='white' width="200px">
                                            <NumberInputField value={amount}
                                                              onChange={(e) => {
                                                                  setAmount(e.target.value);
                                                                  setActualPrice(parseInt(e.target.value) * 99)
                                                              }}/>
                                        </NumberInput><br/><br/>
                                    </Center>
                                    {state.walletWeb3Modal.connected &&
                                        <Center>
                                            <Button size='md'
                                                    height='48px'
                                                    width='220px'
                                                    border='2px'
                                                    bg='#C2DCA5'
                                                    borderColor='#4E6840'
                                                    disabled={canMint()}
                                                    _hover={{bg: '#D6E9CF'}} onClick={() => {
                                                mintMicrobe().then(r => setMinted(true))
                                            }}>
                                                Mint
                                            </Button>
                                        </Center>}
                                </Box>
                            }
                            {state.walletWeb3Modal.connected && actualPrice > 0 &&
                                <Box>
                                    <p>Mint {amount} miCRObes for {actualPrice} CRO</p>
                                </Box>}
                            {/*{state.walletWeb3Modal.connected &&*/}
                            {/*    <Box>*/}
                            {/*        <p>{supplyLeft} miCRObes left to mint</p>*/}
                            {/*    </Box>}*/}
                            {state.walletWeb3Modal.connected &&
                                <Box w="75%" borderBottom='1px solid' borderColor='#4E6840' borderStyle='dashed'
                                     paddingBottom='20px'>
                                    {show && isEligible &&
                                        <Center><p>This token is not eligible</p></Center>}
                                    {show && !isEligible &&
                                        <Center><p>This token is eligible</p></Center>}
                                </Box>}
                            {state.walletWeb3Modal.connected &&
                                <Box>
                                    <Center>
                                        <NumberInput bg='white' width="200px">
                                            <NumberInputField value={id}
                                                              onChange={(e) => setId(e.target.value)}/>
                                        </NumberInput><br/><br/>
                                    </Center>
                                    <Center>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                                            isTokenEligible().then(() => {
                                                setShow(true)
                                            })
                                        }}>
                                            Check if Token is eligible
                                        </Button></Center>
                                </Box>
                            }
                            {state.walletWeb3Modal.connected &&
                                <Box w="75%" borderBottom='1px solid' borderColor='#4E6840' borderStyle='dashed'
                                     paddingBottom='20px'>
                                    {show && isEligible &&
                                        <Center><p>This token is not eligible</p></Center>}
                                    {show && !isEligible &&
                                        <Center><p>This token is eligible</p></Center>}
                                </Box>}
                            <Box>
                                {state.walletWeb3Modal.connected &&
                                    <Center>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={disconnectWallet}>
                                            Disconnect
                                        </Button>
                                    </Center>}
                            </Box>
                        </VStack>
                    </Center>
                </main>
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
