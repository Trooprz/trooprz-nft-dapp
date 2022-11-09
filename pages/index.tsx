import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React, {useState} from "react";
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
import * as config from "../config/config";

interface IProps {
}

const Home: React.FC<IProps> = () => {
    const {state, dispatch} = React.useContext(Store);
    const [tokensInWallet, setTokensInWallet] = useState([]);
    const [isMicrobesFlow, setIsMicrobesFlow] = useState(false);
    const [isTrooprzFlow, setIsTrooprzFlow] = useState(false);
    const [isSummary, setIsSummary] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [validated, setValidated] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [isCheckOGTrooprzFlow, setIsCheckOGTrooprzFlow] = useState(false);
    const [isMutantzFlow, setIsMutantzFlow] = useState(false);

    const toast = useToast();
    let web3Modal;
    let mutantzList = new Set();

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

    const fetchAmountOfMutantzInWallet = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });

        const data = await utils.getMutantzInWallet(state.walletWeb3Modal.provider, state.walletWeb3Modal.address, state.queryResults.mutantzBalance);

        updateRefreshingAction(dispatch, {
            status: false,
            message: "Complete",
        });
        console.log(data)

        return data;
    }


    const addToMutantzList = (token) => {
        if (mutantzList.size === 0) {
            mutantzList.add(token);
        } else if (mutantzList.has(token)) {
            mutantzList.delete(token);
        } else {
            mutantzList.add(token);
        }
    }

    const getMutantzFromStorage = () => {
        let mutantzArray = [];
        const microbes = JSON.parse(sessionStorage.getItem('mutantzList'));
        mutantzArray = Array.from(microbes);
        return mutantzArray;
    }

    const checkMutantz = () => {
        return tokensInWallet.length > 0;
    }

    const checkAmountOfMutantzSelected = () => {
        if (mutantzList.size === 0) {
            toast({
                title: 'Fail',
                description: "You have to select at least one Mutant.",
                status: "error",
                duration: 9000,
                isClosable: true
            })
        } else if (mutantzList.size > 5) {
            toast({
                title: 'Fail',
                description: "Due to performance issues, you can not send more than 5 Mutantz per turn. You can't select more than 5 Mutantz.",
                status: "error",
                duration: 9000,
                isClosable: true
            })
        } else {
            setTokensInWallet([]);
            setIsTrooprzFlow(false);
            setIsMicrobesFlow(true);
            fetchAmountOfMutantzInWallet().then(r => setTokensInWallet(r));
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
            const tx = await microbesWriteContractInstance["setApprovalForAll"]("0x96628048830a499b156aBdC04cC169C18c3A17f2", true);

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

    const sendMutantz = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });
        const mutantzWriteContractInstance = await utils.getMutantzWriteContractInstance(
            state.walletWeb3Modal.provider,
        );

        try {
            let mutantzArray = getMutantzFromStorage()
            for (let i = 0; i < mutantzList.size; i++) {
                const tx = await mutantzWriteContractInstance["safeTransferFrom"](state.walletWeb3Modal.address, config.configVars.erc20.attackAddress, mutantzArray[i]);

                await tx.wait();
            }
            toast({
                title: 'Mutantz sent!',
                description: 'Your Mutantz have been sent!',
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
                                                <ListItem>Select Mutantz you want to use to attack!</ListItem>
                                            </UnorderedList></Center>
                                    </>
                                </Box>}
                            {state.walletWeb3Modal.connected && !isMutantzFlow && !isSummary &&
                                <Box>
                                    <Center>
                                        <Text color={"white"}>What do you want to do?</Text>
                                    </Center>
                                    <Center>
                                        <Button size='md'
                                                height='48px'
                                                width='220px'
                                                border='2px'
                                                bg='#C2DCA5'
                                                borderColor='#4E6840'
                                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                                            setIsMutantzFlow(true);
                                            fetchAmountOfMutantzInWallet().then(r => setTokensInWallet(r))
                                        }}>
                                            Start selecting Mutantz
                                        </Button></Center><br/>
                                </Box>
                            }

                            {state.walletWeb3Modal.connected && state.refreshing.status && isMutantzFlow &&
                                <Box>
                                    <Center>
                                        <Text color={"white"}>Please be patient while we load your eligible
                                            Mutantz</Text>
                                    </Center><br/>
                                    <Center>
                                        <Spinner color={"white"}>
                                        </Spinner></Center>
                                </Box>}
                            {state.walletWeb3Modal.connected && isMutantzFlow &&
                                <Box w={'100%'}>
                                    <Center>
                                        <Text color={"white"}>Select max 5 Mutantz per turn</Text>
                                    </Center><br/>
                                    {state.walletWeb3Modal.connected && !state.refreshing.status && isMutantzFlow && !isSummary && !checkMutantz() &&
                                        <Center>
                                            <Text color={"white"}>
                                                You don&lsquo;t seem to have any Mutantz.
                                            </Text>
                                        </Center>
                                    }
                                    <Center>
                                        <SimpleGrid columns={[2, 4]} spacing={[5, 10]}>
                                            {tokensInWallet.map((token) => (
                                                <Image
                                                    className="clickable"
                                                    key={token}
                                                    onClick={(e) => {
                                                        addToMutantzList(token);
                                                        selected(e);
                                                    }}
                                                    boxSize='150px'
                                                    objectFit='cover'
                                                    src={`https://cdn.ebisusbay.com/proxy/https://bafybeib2gmwun7cuksemlaxdlujbwqsm5k6b6h3vq42fmhr5c4y63xik2q.ipfs.nftstorage.link/${token}.png`}
                                                    alt={`Mutantz id ${token}`}
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
                                            sessionStorage.setItem("mutantzList", JSON.stringify(Array.from(mutantzList)));
                                            checkAmountOfMutantzSelected();
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

                            {state.walletWeb3Modal.connected && isSummary && !isMutantzFlow &&
                                <Box>
                                    <Center>
                                        <Text color={"white"}>You are about to send Mutantz off to attack!</Text><br/>
                                    </Center>
                                    <Center>
                                        <Text color={"white"}>Here&lsquo;s an overview of Mutantz
                                            used for this:</Text>
                                    </Center>
                                    <Center>
                                        <SimpleGrid columns={[2, 5]} spacing={[5, 10]}>
                                            {getMutantzFromStorage().map((token) => (
                                                <Image
                                                    key={token}
                                                    boxSize='150px'
                                                    objectFit='cover'
                                                    src={`https://cdn.ebisusbay.com/proxy/https://bafybeib2gmwun7cuksemlaxdlujbwqsm5k6b6h3vq42fmhr5c4y63xik2q.ipfs.nftstorage.link/${token}.png`}
                                                    alt={`Mutantz id ${token}`}
                                                />))}
                                        </SimpleGrid>
                                    </Center><br/>

                                    {state.walletWeb3Modal.connected && !state.queryResults.approved &&
                                        <>
                                            <Center>
                                                <Text color={"white"}>
                                                    Step 1: Click &lsquo;Validate Send&lsquo; (Only required once)
                                                </Text>
                                            </Center><br/>
                                            <Center>
                                                <Text color={"white"}>
                                                    Step 2: Click &lsquo;Send Mutantz&lsquo;
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
                                                    getApproval();
                                                    setIsApproved(state.queryResults.approved);
                                                }}>
                                                    Validate Burn
                                                </Button>
                                            </Center><br/></>}
                                    {state.walletWeb3Modal.connected && state.refreshing.status && !isMutantzFlow && !isSending && state.queryResults.approved &&
                                        <Box>
                                            <Center>
                                                <Text color={"white"}>Approving Mutantz send</Text>
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
                                            setIsSending(true);
                                            sendMutantz();
                                        }}>
                                            Send Mutantz
                                        </Button>
                                    </Center><br/>
                                </Box>
                            }
                            {state.walletWeb3Modal.connected && state.refreshing.status && !isMicrobesFlow && !isTrooprzFlow && isSending &&
                                <Box>
                                    <Center>
                                        <Text color={"white"}>Hang tight, your Mutantz are being sent off to
                                            attack!!</Text>
                                    </Center><br/>
                                    <Center>
                                        <Spinner color={"white"}></Spinner>
                                    </Center>
                                </Box>
                            }
                            {state.walletWeb3Modal.connected && !isCheckOGTrooprzFlow || isMicrobesFlow || isTrooprzFlow || isSummary &&
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
                                                Send more Mutantz
                                            </Button>
                                        </Center>}
                                </Box>}
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
