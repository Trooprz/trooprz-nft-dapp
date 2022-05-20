import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React, {useEffect, useState} from "react";
import {Store} from "../store/store-reducer";
import {updateQueryResultsAction, updateRefreshingAction, updateWalletWeb3ModalAction} from "../store/actions";
import {
    Box,
    Button,
    Center,
    Image,
    ListItem,
    NumberInput,
    NumberInputField, SimpleGrid, Spinner, Stack,
    Text,
    UnorderedList,
    VStack
} from '@chakra-ui/react';
import * as utils from "../helpers/utils";
import {checkIfTokenIsEligible} from "../helpers/utils";
import {BigNumber} from "ethers";
import Header from "./mint/Header";
import {defaultQueryResults, defaultWalletWeb3Modal} from "../store/interfaces";
import Web3Modal from "web3modal";
import providerOptions from "../config/ProviderOptions";
import Link from "next/link";
import _, {set} from "lodash";

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
    const [supplyLeft, setSupplyLeft] = useState(0);
    const [isGoldenFlow, setIsGoldenFlow] = useState(false);
    const [isRegularFlow, setIsRegularFlow] = useState(false);
    const [goldenMicrobesInWallet, setGoldenMicrobesInWallet] = useState([]);
    const [selectOGTrooprz, setSelectOGTrooprz] = useState(false);
    const [token, setToken] = useState(0);
    let claimWallet: any[];
    let duplicateFound = false;
    let web3Modal;
    let microbesList = new Set();

    if (typeof window !== 'undefined') {
        web3Modal = new Web3Modal({
            providerOptions
        })
    }


    useEffect(() => {
        //     const fetchAmountOfGoldenMicrobesInWallet = async () => {
        //         const data = await utils.getGoldenMicrobesInWallet(state.walletWeb3Modal.provider, state.walletWeb3Modal.address, state.queryResults.erc20Balance);
        //         setGoldenMicrobesInWallet(data);
        //     }
        // fetchAmountOfTokensInWallet().catch(console.error);
        // const fetchIneligibleTokensInWallet = async () => {
        //     const data = await utils.getIneligibleTokens(state.walletWeb3Modal.provider, state.walletWeb3Modal.address, state.queryResults.erc20Balance);
        //     setIneligibleTokensInWallet(data);
        // }
        // fetchIneligibleTokensInWallet().catch(console.error);

        async function calculateSupplyLeft() {
            await utils.getTotalSupplyLeft(state.walletWeb3Modal.provider).then((result) => {
                setSupplyLeft(result);
                updateQueryResultsAction(dispatch, {
                        ...state.queryResults,
                        supplyLeft: result,
                    }
                )
            })
        }

        calculateSupplyLeft().catch(console.error)

    }, [state.walletWeb3Modal.connected])
    // const selectMicrobes: (id) => void = (id) => {
    //     let microbesList = []
    //     if (microbesList) {
    //         if (microbesList.length != 0) {
    //             for (let i = 0; i < microbesList.length; i++) {
    //                 if (microbesList[i] === id) {
    //                     microbesList.splice(i, 1);
    //                 }
    //             }
    //         }
    //         microbesList.push(id);
    //         console.log(microbesList);
    //     }
    // }

    const fetchAmountOfTokensInWallet = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });

        const data = await utils.getTokensInWallet(state.walletWeb3Modal.provider, state.walletWeb3Modal.address, state.queryResults.erc20Balance);

        updateRefreshingAction(dispatch, {
            status: false,
            message: "Complete",
        });

        return data;
    }

    const addToMicrobesList = (token) => {
        if (microbesList.size === 0) {
            console.log("List is empty, adding " + token);
            microbesList.add(token);
        } else if (microbesList.has(token)) {
            console.log("removing " + token);
            microbesList.delete(token);
        } else {
            microbesList.add(token);
        }
    }


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
                                                <ListItem>Mint is LIVE</ListItem>
                                                <ListItem>Don&lsquo;t forget you will need 1 OG Trooprz + 4 miCRObes to
                                                    SPAWN Mutantz</ListItem>
                                                <ListItem><Link
                                                    href="https://app.ebisusbay.com/collection/trooprz">https://app.ebisusbay.com/collection/trooprz</Link></ListItem>
                                            </UnorderedList></Center>
                                    </>
                                </Box>}
                            {state.walletWeb3Modal.connected && !isGoldenFlow && !isRegularFlow &&
                                <Box>
                                    <Center>
                                        <Text>What kind of miCRObes will you use to spawn your Mutantz?</Text>
                                    </Center>
                                    <Center>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                                            setIsGoldenFlow(true);
                                            fetchAmountOfTokensInWallet().then(r => setTokensInWallet(r))
                                        }}>
                                            Golden miCRObes
                                        </Button>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                                            setIsRegularFlow(true);
                                            fetchAmountOfTokensInWallet().then(r => setTokensInWallet(r))
                                        }}>
                                            Regular miCRObes
                                        </Button></Center><br/>
                                </Box>
                            }
                            {state.walletWeb3Modal.connected && state.refreshing.status &&
                                <Spinner></Spinner>}
                            {state.walletWeb3Modal.connected && isGoldenFlow && !isRegularFlow &&
                                <Box>
                                    <Center>
                                        <Text>Choose your Golden miCRObes</Text>
                                    </Center>
                                    <SimpleGrid columns={5} spacing={10}>
                                        {tokensInWallet.map((token) => (
                                            <Image
                                                key={token}
                                                // onSelect={}
                                                onClick={() => {
                                                    addToMicrobesList(token);
                                                    console.log("Clicked token " + token)
                                                }}
                                                boxSize='150px'
                                                objectFit='cover'
                                                src={`https://bafybeiahztecs7irzovvdohc3enk5v7wwvypfi66diskhwjqu6zbddeg3q.ipfs.nftstorage.link/${token}.png`}
                                                alt={`miCRObes id ${token}`}/>
                                        ))}
                                    </SimpleGrid><br/>
                                    <Center>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                                            setSelectOGTrooprz(true);
                                            console.log(microbesList)
                                        }}>
                                            Continue
                                        </Button>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => setIsGoldenFlow(false)}>
                                            Back
                                        </Button>
                                    </Center>
                                </Box>
                            }
                            {state.walletWeb3Modal.connected && !isGoldenFlow && isRegularFlow &&
                                <Box>
                                    <Center>
                                        <Text>Choose your miCRObes</Text>
                                    </Center>
                                    <SimpleGrid columns={5} spacing={10}>
                                        {tokensInWallet.map((token) => (
                                            <Image
                                                key={'token'}
                                                boxSize='150px'
                                                onClick={() => {
                                                    addToMicrobesList(token);
                                                    console.log("Clicked token " + token)
                                                }}
                                                objectFit='cover'
                                                src={`https://bafybeiahztecs7irzovvdohc3enk5v7wwvypfi66diskhwjqu6zbddeg3q.ipfs.nftstorage.link/${token}.png`}
                                                alt={`miCRObes id ${token}`}/>))}
                                    </SimpleGrid><br/>
                                    <Center>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                                            setSelectOGTrooprz(true);
                                            console.log(microbesList)
                                        }}>
                                            Continue
                                        </Button>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => setIsRegularFlow(false)}>
                                            Back
                                        </Button>
                                    </Center>
                                </Box>
                            }

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
