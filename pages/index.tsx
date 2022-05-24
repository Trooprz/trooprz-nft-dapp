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

interface IProps {
}

const Home: React.FC<IProps> = () => {
    const {state, dispatch} = React.useContext(Store);
    const [tokensInWallet, setTokensInWallet] = useState([]);
    const [isMicrobesFlow, setIsMicrobesFlow] = useState(false);
    const [isTrooprzFlow, setIsTrooprzFlow] = useState(false);
    const [isSummary, setIsSummary] = useState(false);
    const [isSpawning, setIsSpawning] = useState(false);
    const [validated, setValidated] = useState(false);
    const [isApproved, setIsApproved] = useState(false);

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

    const checkIsApproved = () => {
        return state.queryResults.approved;
    }

    const getMicrobesBalance = async () => {
        const microbesBalance = await utils.getMicrobesBalance(state.walletWeb3Modal.provider, state.walletWeb3Modal.address);
        updateQueryResultsAction(dispatch, {
            ...defaultQueryResults,
            trooprzBalance: state.queryResults.trooprzBalance,
            approved: state.queryResults.approved,
            provider: state.walletWeb3Modal.provider,
            signer: state.walletWeb3Modal.signer,
            microbesBalance: microbesBalance
        });
    }

    const fetchAmountOfMicrobesInWallet = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });

        console.log("AMOUNT OF MICROBES: " + state.queryResults.microbesBalance)

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
        if (trooprzSize < 0) {
            toast({
                title: 'Fail',
                description: "Amounts are incorrect. You selected too many miCRObes",
                status: "error",
                duration: 9000,
                isClosable: true
            })
        } else if (trooprzSize > 0) {
            toast({
                title:
                    'Fail',
                description:
                    "Amounts are incorrect. You need " + trooprzSize * 4 + " more regular miCRObes or " + trooprzSize + " more golden miCRObes.",
                status:
                    "error",
                duration: 9000,
                isClosable: true
            })
        } else {
            setTokensInWallet([]);
            setIsTrooprzFlow(false);
            setIsMicrobesFlow(false);
            setIsSummary(true);
        }
    }


    const getTrooprzFromStorage = () => {
        let trooprzArray = [];
        const trooprz = JSON.parse(sessionStorage.getItem('trooprzList'));
        trooprzArray = Array.from(trooprz);
        return trooprzArray;
    }

    const checkAmountOfTrooprzSelected = () => {
        if (trooprzList.size === 0) {
            toast({
                title: 'Fail',
                description: "You have to select at least one Troopr.",
                status: "error",
                duration: 9000,
                isClosable: true
            })
        } else if (trooprzList.size > 5) {
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
            fetchAmountOfMicrobesInWallet().then(r => setTokensInWallet(r));
        }
    }

    const getApproval = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });
        const microbesWriteContractInstance = await utils.getMicrobesWriteContractInstance(
            state.walletWeb3Modal.provider,
        );

        try {
            const tx = await microbesWriteContractInstance["setApprovalForAll"]("0x8042414529898330a5be01870F7dfd4De9C4F803", true);

            await tx.wait();
            toast({
                title: 'Approval succesful',
                status: 'success',
                duration: 9000,
                isClosable: true
            })

        } catch (error) {
            console.log(error);
            if (state.walletWeb3Modal.provider.connection.url === 'metamask') {
                toast({
                    title: 'Error!',
                    status: 'error',
                    description: 'Error: ' + error.data.message,
                    duration: 9000,
                    isClosable: true
                })
            } else {
                toast({
                    title: 'Error!',
                    status: 'error',
                    description: 'Error: ' + error.message,
                    duration: 9000,
                    isClosable: true
                })
            }
        }
        updateRefreshingAction(dispatch, {
            status: false,
            message: "Complete",
        });
    }

    const spawnMutantz = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });
        const mutantzWriteContractInstance = await utils.getMutantzWriteContractInstance(
            state.walletWeb3Modal.provider,
        );

        try {
            const tx = await mutantzWriteContractInstance["spawn"](getMicrobesFromStorage(), getTrooprzFromStorage(), state.walletWeb3Modal.address);

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
            if (state.walletWeb3Modal.provider.connection.url === 'metamask') {
                toast({
                    title: 'Error!',
                    status: 'error',
                    description: 'Error: ' + error.message,
                    duration: 9000,
                    isClosable: true
                })
            } else {
                toast({
                    title: 'Error!',
                    status: 'error',
                    description: 'Error: ' + error.message,
                    duration: 9000,
                    isClosable: true
                })
            }
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
                                                <ListItem>You will need <b>1 OG Trooprz</b> + <b>4
                                                    miCRObes</b> or <b>1 golden miCRObe</b> to
                                                    SPAWN Mutantz</ListItem>
                                                <ListItem>Due to chain performance reasons, you can spawn a max
                                                    of <b>5
                                                        Mutantz</b> per turn</ListItem>
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
                                            console.log(state.walletWeb3Modal.address);
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
                            {state.walletWeb3Modal.connected && isTrooprzFlow && !isMicrobesFlow && !isSummary &&
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
                                            console.log(state.queryResults.microbesBalance)
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
                                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                                            setIsTrooprzFlow(false);
                                            setTokensInWallet([])
                                        }}>
                                            Back
                                        </Button>
                                    </Center><br/>
                                </Box>
                            }

                            {state.walletWeb3Modal.connected && state.refreshing.status && !isTrooprzFlow && isMicrobesFlow && !isSummary &&
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
                                    </Center><br/>
                                    <Center>
                                        <Text color={'white'}>You have selected <b>{getTrooprzSize()} Trooprz</b>.
                                            You
                                            need <b>{getTrooprzSize() * 4} miCRObes</b> or <b>{getTrooprzSize()} golden
                                                miCRObes</b>.</Text>
                                    </Center><br/>

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
                                        <Text color={"white"}>
                                            Press <b>Continue</b> to check if your amount of provided miCRObes is
                                            correct. If it is not, a message will pop up telling you how to fix it.
                                        </Text>
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
                                            validateAmount();
                                            console.log(microbesList);
                                            console.log(state.queryResults.approved);
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
                                            setValidated(false);
                                            setTokensInWallet([]);
                                            fetchAmountOfOGTrooprzInWallet().then(r => setTokensInWallet(r))
                                        }}>
                                            Back
                                        </Button>
                                    </Center><br/>
                                </Box>
                            }

                            {state.walletWeb3Modal.connected && isSummary && !isTrooprzFlow && !isMicrobesFlow &&
                                <Box>
                                    <Center>
                                        <Text color={"white"}>You are about to spawn Mutantz!</Text><br/>
                                    </Center>
                                    <Center>
                                        <Text color={"white"}>Here&lsquo;s an overview of OG Trooprz and miCRObes
                                            used for this:</Text>
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
                                    {state.walletWeb3Modal.connected && !state.queryResults.approved &&
                                        <>
                                            <Center>
                                                <Text color={"white"}>
                                                    You have to <b>one-time approve</b> the burning of your
                                                    miCRObes. This only happens when spawning for the first time.
                                                </Text>
                                            </Center>
                                            <Center>
                                                <Button size='md'
                                                        height='48px'
                                                        width='220px'
                                                        border='2px'
                                                        bg='#C2DCA5'
                                                        borderColor='#4E6840'
                                                        _hover={{bg: '#D6E9CF'}} onClick={() => {
                                                    setIsSpawning(true);
                                                    getApproval();
                                                    setIsApproved(state.queryResults.approved);
                                                    console.log(getMicrobesFromStorage());
                                                    console.log(getTrooprzFromStorage());
                                                }}>
                                                    Burn miCRObes
                                                </Button>
                                            </Center><br/></>}
                                    {state.walletWeb3Modal.connected && state.refreshing.status && !isMicrobesFlow && !isTrooprzFlow && !isSpawning && state.queryResults.approved &&
                                        <Box>
                                            <Center>
                                                <Text color={"white"}>Approving miCRObes burn</Text>
                                            </Center><br/>
                                            <Center>
                                                <Spinner color={"white"}></Spinner>
                                            </Center><br/>
                                        </Box>
                                    }
                                    <Center>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                                            setIsSpawning(true);
                                            spawnMutantz();
                                            console.log(getMicrobesFromStorage());
                                            console.log(getTrooprzFromStorage())
                                        }}>
                                            Spawn Mutantz
                                        </Button>
                                    </Center><br/>
                                </Box>
                            }
                            {state.walletWeb3Modal.connected && state.refreshing.status && !isMicrobesFlow && !isTrooprzFlow && isSpawning && state.queryResults.approved &&
                                <Box>
                                    <Center>
                                        <Text color={"white"}>Hang tight, your Mutantz are spawning!!</Text>
                                    </Center><br/>
                                    <Center>
                                        <Spinner color={"white"}></Spinner>
                                    </Center>
                                </Box>
                            }
                            <Box>
                                {state.walletWeb3Modal.connected &&
                                    <Center>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                                            window.location.reload()
                                        }}>
                                            Spawn Again
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
