import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React, {useCallback, useEffect, useState} from "react";
import {Store} from "../store/store-reducer";
import {updateQueryResultsAction, updateRefreshingAction, updateWalletWeb3ModalAction} from "../store/actions";
import {
    Box,
    Button,
    Center,
    Image,
    ListItem,
    SimpleGrid,
    Spinner,
    Text,
    UnorderedList,
    useToast,
    VStack
} from '@chakra-ui/react';
import * as utils from "../helpers/utils";
import Header from "./mint/Header";
import {defaultQueryResults, defaultWalletWeb3Modal} from "../store/interfaces";
import Web3Modal from "web3modal";
import providerOptions from "../config/ProviderOptions";
import Link from "next/link";
import {isDisabled} from "@chakra-ui/utils";
import {indexOf} from "lodash";

interface IProps {
}

const Home: React.FC<IProps> = () => {
    const {state, dispatch} = React.useContext(Store);
    const [tokensInWallet, setTokensInWallet] = useState([]);
    const [isMicrobesFlow, setIsMicrobesFlow] = useState(false);
    const [isTrooprzFlow, setIsTrooprzFlow] = useState(false);
    const [isSummary, setIsSummary] = useState(false);
    const [isSpawning, setIsSpawning] = useState(false);
    const [trooprzCounter, setTrooprzCounter] = useState(0);

    const toast = useToast();
    let web3Modal;
    let microbesList = new Set();
    let trooprzList = new Set();

    function selected(e) {
        let target = e.currentTarget;
        target.classList.toggle('selected')
    }

    if (typeof window !== 'undefined') {
        web3Modal = new Web3Modal({
            providerOptions
        })
    }

    const fetchAmountOfMicrobesInWallet = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });

        const data = await utils.getMicrobesInWallet(state.walletWeb3Modal.provider, state.walletWeb3Modal.address, state.queryResults.microbesBalance);

        updateRefreshingAction(dispatch, {
            status: false,
            message: "Complete",
        });

        return data;
    }

    const fetchAmountOfOGTrooprzInWallet = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });
        console.log(state.queryResults.trooprzBalance);

        const data = await utils.getOGTrooprzInWallet(state.walletWeb3Modal.provider, state.walletWeb3Modal.address, state.queryResults.trooprzBalance);

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

    const addToTrooprzList = (token) => {
        if (trooprzList.size === 0) {
            console.log("List is empty, adding " + token);
            trooprzList.add(token);
        } else if (trooprzList.has(token)) {
            console.log("removing " + token);
            trooprzList.delete(token);
        } else {
            trooprzList.add(token);
        }
        // if (trooprzList.size === 0) {
        //     setTrooprzList(previousState => new Set(previousState.add(token)));
        // }
        // else if (trooprzList.has(token)) {
        //     setTrooprzList(prevState => new Set([...prevState].filter(x => x !== token)));
        //     }
        // else {
        //     setTrooprzList(prevState => new Set(prevState.add(token));
        // }
    }

    const getMicrobesFromStorage = () => {
        let microbesArray = [];
        const microbes = JSON.parse(sessionStorage.getItem('microbesList'));
        microbesArray = Array.from(microbes);
        return microbesArray;
    }

    const getTrooprzSize = () => {
        const trooprz = JSON.parse(sessionStorage.getItem('trooprzList'));
        let trooprzList = Array.from(trooprz);
        return trooprzList.length;
    }

    const validateAmount = () => {
        let trooprzSize = getTrooprzSize();
        const microbes = JSON.parse(sessionStorage.getItem('microbesList'));
        let microbesList = Array.from(microbes);
        for (let i = 0; i < microbesList.length; i++) {
            if (microbesList[i] <= 222) {
                trooprzSize = trooprzSize - 1;
            } else {
                trooprzSize = trooprzSize - 0.25;
            }
        }
        if (trooprzSize === 0) {
            toast({
                title: 'Succes',
                description: 'Amounts are correct. You can spawn your Mutantz!',
                status: 'success',
                duration: 9000,
                isClosable: true
            })
            return true;
        } else if (trooprzSize < 0) {
            toast({
                title: 'Fail',
                description: "Amounts are incorrect. You selected too many miCRObes",
                status: "error",
                duration: 9000,
                isClosable: true
            })
            return false;
        } else {
            toast({
                title: 'Fail',
                description: "Amounts are incorrect. You need " + trooprzSize * 4 + " more regular miCRObes or " + trooprzSize + " more golden miCRObes.",
                status: "error",
                duration: 9000,
                isClosable: true
            })
            return false;
            // return "Amounts are incorrect. You need " + trooprzSize * 4 + " more miCRObes.";
        }
    }

    const getTrooprzFromStorage = () => {
        let trooprzArray = [];
        const trooprz = JSON.parse(sessionStorage.getItem('trooprzList'));
        trooprzArray = Array.from(trooprz);
        return trooprzArray;
    }

    const checkAmountOfTrooprzSelected = () => {
        if (trooprzList.size > 5) {
            toast({
                title: 'Fail',
                description: "Due to performance issues, you can not mint more than 5 Mutantz per turn. You can't select more than 5 OG Trooprz.",
                status: "error",
                duration: 9000,
                isClosable: true
            })
        } else {
            setTokensInWallet([]);
            setIsTrooprzFlow(false);
            setIsMicrobesFlow(true);
            fetchAmountOfMicrobesInWallet().then(r => setTokensInWallet(r))
        }
    }

    const spawnMutantz = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });
        const mutantzWriteContractInstance = await utils.getWriteContractInstance(
            state.walletWeb3Modal.provider,
        );

        try {
            const tx = await mutantzWriteContractInstance["spawn"](getMicrobesFromStorage(), getTrooprzFromStorage());

            await tx.wait();
            toast({
                title: 'Mutantz spawned!',
                description: 'Your Mutantz have been spawned!',
                status: 'success',
                duration: 9000,
                isClosable: true
            })

        } catch (error) {
            console.log(error);
            toast({
                title: 'MAYDAY!',
                description: 'There was an error'
            })
        }
        updateRefreshingAction(dispatch, {
            status: false,
            message: "Complete",
        });
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
                        <VStack>
                            <Box w="60%">
                                <Image src="/images/Mutantz-Logo.png"/>
                            </Box>
                            <Header/>
                            {state.walletWeb3Modal.connected &&
                                <Box w="100%" borderBottom='1px solid' borderColor='#4E6840' borderStyle='dashed'>


                                    <><Center><Text fontSize="5xl" color={"white"}>
                                        Pew! Pew! Pew!
                                    </Text></Center>
                                        <Center>
                                            <UnorderedList color={"white"}>
                                                <ListItem>miCRObes have SOLD OUT!</ListItem>
                                                <ListItem>MUTANTZ SPAWN is LIVE!</ListItem>
                                                <ListItem>You will need 1 OG Trooprz + 4 miCRObes or 1 golden miCRObe to
                                                    SPAWN Mutantz</ListItem>
                                                <ListItem>Due to chain performance reasons, you can spawn a max of 5
                                                    Mutantz per turn</ListItem>
                                                <ListItem><Link
                                                    href="https://app.ebisusbay.com/collection/trooprz">https://app.ebisusbay.com/collection/trooprz</Link></ListItem>
                                            </UnorderedList></Center>
                                    </>
                                </Box>}
                            {state.walletWeb3Modal.connected && !isMicrobesFlow && !isTrooprzFlow && !isSummary &&
                                <Box>
                                    <Center>
                                        <Text color={"white"}>Start spawning Mutantz</Text>
                                    </Center>
                                    <Center>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                                            setIsTrooprzFlow(true);
                                            fetchAmountOfOGTrooprzInWallet().then(r => setTokensInWallet(r))
                                        }}>
                                            Select OG Trooprz
                                        </Button></Center><br/>
                                </Box>
                            }

                            {state.walletWeb3Modal.connected && state.refreshing.status && !isMicrobesFlow && isTrooprzFlow &&
                                <Box>
                                    <Center>
                                        <Text color={"white"}>Please be patient while we load your eligible OG
                                            Trooprz</Text>
                                    </Center><br/>
                                    <Center>
                                        <Spinner color={"white"}>
                                        </Spinner></Center>
                                </Box>}
                            {state.walletWeb3Modal.connected && isTrooprzFlow &&
                                <Box w={'100%'}>
                                    <Center>
                                        <Text color={"white"}>Select max 5 OG Trooprz per turn</Text>
                                    </Center>
                                    <Center>
                                        <SimpleGrid columns={[2, 4]} spacing={[5, 10]}>
                                            {tokensInWallet.map((token) => (
                                                <Image
                                                    className="clickable"
                                                    key={token}
                                                    onClick={(e) => {
                                                        addToTrooprzList(token);
                                                        console.log("Clicked token " + token);
                                                        selected(e);
                                                    }}
                                                    boxSize='150px'
                                                    objectFit='cover'
                                                    src={`https://bafybeib2gmwun7cuksemlaxdlujbwqsm5k6b6h3vq42fmhr5c4y63xik2q.ipfs.nftstorage.link/${token}.png`}
                                                    alt={`trooprz id ${token}`}
                                                />
                                            ))}
                                        </SimpleGrid></Center><br/>

                                    <Center>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                                            sessionStorage.setItem("trooprzList", JSON.stringify(Array.from(trooprzList)));
                                            checkAmountOfTrooprzSelected();
                                            console.log(sessionStorage.getItem('trooprzList'))
                                        }}>
                                            Continue
                                        </Button>
                                    </Center>
                                    <br/>
                                    <Center>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => setIsTrooprzFlow(false)}>
                                            Back
                                        </Button>
                                    </Center>
                                </Box>
                            }

                            {state.walletWeb3Modal.connected && state.refreshing.status && !isTrooprzFlow && isMicrobesFlow &&
                                <Box>
                                    <Center>
                                        <Text color={"white"}>Please be patient while we load your miCRObes</Text>
                                    </Center><br/>
                                    <Center>
                                        <Spinner color={"white"}>
                                        </Spinner></Center>
                                </Box>}


                            {state.walletWeb3Modal.connected && isMicrobesFlow && !isTrooprzFlow && !isSummary &&
                                <Box>
                                    <Center>
                                        <Text color={"white"}>Select your miCRObes</Text>
                                    </Center>
                                    <Center>
                                        <SimpleGrid columns={[2, 4]} spacing={[5, 10]}>
                                            {tokensInWallet.map((token) => (
                                                <Image
                                                    className="clickable"
                                                    key={token}
                                                    onClick={(e) => {
                                                        addToMicrobesList(token);
                                                        selected(e);
                                                        console.log("Clicked token " + token)
                                                    }}
                                                    boxSize='150px'
                                                    objectFit='cover'
                                                    src={`https://bafybeiahztecs7irzovvdohc3enk5v7wwvypfi66diskhwjqu6zbddeg3q.ipfs.nftstorage.link/${token}.png`}
                                                    alt={`miCRObes id ${token}`}
                                                />
                                            ))}
                                        </SimpleGrid></Center><br/>
                                    <Center>
                                        <Text color={'white'}>You have selected {getTrooprzSize()} Trooprz. You
                                            need {getTrooprzSize() * 4} miCRObes.</Text>
                                    </Center>
                                    <Center>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                                            sessionStorage.setItem("microbesList", JSON.stringify(Array.from(microbesList)));
                                            validateAmount();
                                        }}>
                                            Validate
                                        </Button>
                                    </Center><br/>
                                    <Center>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                                            sessionStorage.setItem("microbesList", JSON.stringify(Array.from(microbesList)));
                                            setTokensInWallet([]);
                                            setIsTrooprzFlow(false);
                                            setIsMicrobesFlow(false);
                                            setIsSummary(true);
                                            console.log(microbesList)
                                        }}>
                                            Continue
                                        </Button>
                                    </Center><br/>
                                    <Center>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                                            setIsMicrobesFlow(false);
                                            setIsTrooprzFlow(true);
                                            setIsSummary(false);
                                            setTokensInWallet([]);
                                            fetchAmountOfOGTrooprzInWallet().then(r => setTokensInWallet(r))
                                        }}>
                                            Back
                                        </Button>
                                    </Center>
                                </Box>
                            }

                            {state.walletWeb3Modal.connected && isSummary && !isTrooprzFlow &&
                                <Box>
                                    <Center>
                                        <Text color={"white"}>You are about to spawn Mutantz!</Text><br/>
                                    </Center>
                                    <Center>
                                        <Text color={"white"}>miCRObes and OG Trooprz used for this:</Text>
                                    </Center>
                                    <Center>
                                        <SimpleGrid columns={[2, 5]} spacing={[5, 10]}>
                                            {getMicrobesFromStorage().map((token) => (
                                                <Image
                                                    key={token}
                                                    // onSelect={}
                                                    boxSize='150px'
                                                    objectFit='cover'
                                                    src={`https://bafybeiahztecs7irzovvdohc3enk5v7wwvypfi66diskhwjqu6zbddeg3q.ipfs.nftstorage.link/${token}.png`}
                                                    alt={`trooprz id ${token}`}
                                                />))}
                                        </SimpleGrid>
                                    </Center><br/>
                                    <Center>
                                        <SimpleGrid columns={5} spacing={10}>
                                            {getTrooprzFromStorage().map((token) => (
                                                <Image
                                                    key={token}
                                                    boxSize='150px'
                                                    objectFit='cover'
                                                    src={`https://bafybeib2gmwun7cuksemlaxdlujbwqsm5k6b6h3vq42fmhr5c4y63xik2q.ipfs.nftstorage.link/${token}.png`}
                                                    alt={`trooprz id ${token}`}
                                                />))}
                                            )
                                        </SimpleGrid>
                                    </Center><br/>
                                    <Center>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                                            setIsSpawning(true);
                                            setIsTrooprzFlow(false);
                                            spawnMutantz();
                                            console.log(getMicrobesFromStorage());
                                            console.log(getTrooprzFromStorage())
                                        }}>
                                            Spawn Mutantz
                                        </Button>
                                    </Center><br/>
                                    <Center>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                                            setIsTrooprzFlow(false);
                                            setIsMicrobesFlow(true);
                                            setTokensInWallet([]);
                                            fetchAmountOfMicrobesInWallet().then(r => setTokensInWallet(r))
                                            setIsSummary(false)
                                        }}>
                                            Back
                                        </Button>
                                    </Center>
                                </Box>
                            }
                            {state.walletWeb3Modal.connected && state.refreshing.status && !isMicrobesFlow && !isTrooprzFlow && isSpawning &&
                                <Box>
                                    <Center>
                                        <Text color={"white"}>Your Mutantz are spawning!</Text>
                                    </Center><br/>
                                    <Center>
                                        <Spinner color={"white"}></Spinner>
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
