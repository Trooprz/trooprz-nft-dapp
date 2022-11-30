import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React, {useState} from "react";
import {Store} from "../store/store-reducer";
import {updateQueryResultsAction, updateRefreshingAction, updateWalletWeb3ModalAction} from "../store/actions";
import {
    Box,
    Button,
    Center, Grid, GridItem,
    Image,
    NumberInput,
    NumberInputField,
    SimpleGrid,
    Spinner,
    Text,
    useToast,
    VStack
} from '@chakra-ui/react';
import * as utils from "../helpers/utils";
import {checkIfMutantzIsEligible, checkIfSuperTrooprzIsEligible} from "../helpers/utils";
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
    const [mutantzInWallet, setMutantzInWallet] = useState([]);
    const [superTrooprzInWallet, setSuperTrooprzInWallet] = useState([]);
    const [isMicrobesFlow, setIsMicrobesFlow] = useState(false);
    const [isTrooprzFlow, setIsTrooprzFlow] = useState(false);
    const [isDefense, setIsDefense] = useState(false);
    const [isAttack, setIsAttack] = useState(false);
    const [isSummary, setIsSummary] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [trooprzId, setTrooprzId] = useState('');
    const [mutantzId, setMutantzId] = useState('');
    const [isMutantzFlow, setIsMutantzFlow] = useState(false);
    const [isChoosing, setIsChoosing] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const toast = useToast();
    let web3Modal;
    let mutantzList = new Set();
    let superTrooprzList = new Set();
    let tokenId = 0;
    let selectedToken = false;

    function selected(e, token) {
        let target = e.currentTarget;
        if (tokenId === 0 && selectedToken === false) {
            target.classList.toggle('selected')
            selectedToken = true;
            tokenId = token
        } else if (token === tokenId) {
            target.classList.toggle('selected')
            tokenId = 0;
            selectedToken = false;
        } else {
            toast({
                title: 'Fail',
                description: "Due to performance issues, you can not send more than 1 Mutant per turn. You can't select more than 1 Mutant.",
                status: "error",
                duration: 9000,
                isClosable: true
            })
            selectedToken = false;
        }
    }


    function selectedSuperTroopr(e, token) {
        let target = e.currentTarget;
        if (tokenId === 0 && selectedToken === false) {
            target.classList.toggle('selectedSuperTroopr')
            selectedToken = true;
            tokenId = token
        } else if (token === tokenId) {
            target.classList.toggle('selectedSuperTroopr')
            tokenId = 0;
            selectedToken = false;
        } else {
            toast({
                title: 'Fail',
                description: "Due to performance issues, you can not send more than 1 SuperTroopr per turn. You can't select more than 1 Mutant.",
                status: "error",
                duration: 9000,
                isClosable: true
            })
            selectedToken = false;
        }
    }

    if (typeof window !== 'undefined') {
        web3Modal = new Web3Modal({
            providerOptions
        })
    }

    const fetchAmountOfSuperTrooprzInWallet = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });

        const data = await utils.getSuperTrooprzInWallet(state.walletWeb3Modal.provider, state.walletWeb3Modal.address, state.queryResults.superTrooprzBalance);

        updateRefreshingAction(dispatch, {
            status: false,
            message: "Complete",
        });
        return data;
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
        return data;
    }

    const checkMutantz = () => {
        return mutantzInWallet.length > 0;
    }

    const checkSuperTrooprz = () => {
        return superTrooprzInWallet.length > 0;
    }

    const getMutantzFromStorage = () => {
        let mutantzArray = [];
        const mutantz = JSON.parse(sessionStorage.getItem('mutantzList'));
        mutantzArray = Array.from(mutantz);
        return mutantzArray;
    }

    const getSuperTrooprzFromStorage = () => {
        let superTrooprzArray = [];
        const superTrooprz = JSON.parse(sessionStorage.getItem('superTrooprzList'));
        superTrooprzArray = Array.from(superTrooprz);
        return superTrooprzArray;
    }

    const checkAmountOfMutantzSelected = () => {
        if (tokenId === 0) {
            toast({
                title: 'Fail',
                description: "You have to select at least one Mutant.",
                status: "error",
                duration: 9000,
                isClosable: true
            })
            setIsSummary(false);
            setIsMutantzFlow(true);
            setIsChoosing(false);
            setIsAttack(true);
            return false;
        }
        return true
    }

    const checkAmountOfSuperTrooprzSelected = () => {
        if (tokenId === 0) {
            toast({
                title: 'Fail',
                description: "You have to select at least one SuperTroopr.",
                status: "error",
                duration: 9000,
                isClosable: true
            })
            setIsSummary(false);
            setIsTrooprzFlow(true);
            setIsChoosing(false);
            setIsDefense(true);
            return false;
        }
        return true;
    }

    const sendMutantz = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });
        const mutantzWriteContractInstance = await utils.getMutantzWriteContractInstance(
            state.walletWeb3Modal.provider,
        );
        if (checkAmountOfMutantzSelected()) {
            try {
                const tx = await mutantzWriteContractInstance["transferFrom"](state.walletWeb3Modal.address, config.configVars.erc20.attackAddress, tokenId);
                await tx.wait();
                toast({
                    title: 'Mutantz sent!',
                    description: 'Your Mutantz have been sent!',
                    status: 'success',
                    duration: 9000,
                    isClosable: true
                })
            } catch (error) {
                if (state.walletWeb3Modal.provider.connection.url === 'metamask') {
                    toast({
                        title: 'Error!',
                        status: 'error',
                        description: 'Error: ' + error.message,
                        duration: 9000,
                        isClosable: true
                    })
                    setIsChoosing(true)
                } else {
                    toast({
                        title: 'Error!',
                        status: 'error',
                        description: 'Error: ' + error.message,
                        duration: 9000,
                        isClosable: true
                    })
                    setIsChoosing(true)
                }
            }
            updateRefreshingAction(dispatch, {
                status: false,
                message: "Complete",
            });
        }
    }

    const isSuperTrooprzTokenEligible = async (id) => {
        if (await checkIfSuperTrooprzIsEligible(id)) {
            toast({
                title: 'Eligible',
                description: "This SuperTroopr is eligible for defense. Get him into the fray!",
                status: "success",
                duration: 9000,
                isClosable: true
            })
        } else {
            toast({
                title: 'Not Eligible',
                description: "This SuperTroopr is tired. Can't send it to the front right now!",
                status: "error",
                duration: 9000,
                isClosable: true
            })
        }
    };

    const isMutantzTokenEligible = async (id) => {
        if (await checkIfMutantzIsEligible(id)) {
            toast({
                title: 'Eligible',
                description: "This Mutant is eligible for attack. Get him into the fray!",
                status: "success",
                duration: 9000,
                isClosable: true
            })
        } else {
            toast({
                title: 'Not Eligible',
                description: "This Mutant is tired. Can't send it to the front right now!",
                status: "error",
                duration: 9000,
                isClosable: true
            })
        }
    };

    const sendSuperTrooprz = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });
        const superTrooprzWriteContractInstance = await utils.getSuperTrooprzWriteContractInstance(
            state.walletWeb3Modal.provider,
        );
        if (checkAmountOfSuperTrooprzSelected()) {
            try {
                const tx = await superTrooprzWriteContractInstance["transferFrom"](state.walletWeb3Modal.address, config.configVars.erc20.protectAddress, tokenId);
                await tx.wait();
                setIsChoosing(true);
                toast({
                    title: 'SuperTrooprz sent!',
                    description: 'Your SuperTrooprz have been sent!',
                    status: 'success',
                    duration: 9000,
                    isClosable: true
                })

            } catch
                (error) {
                if (state.walletWeb3Modal.provider.connection.url === 'metamask') {
                    toast({
                        title: 'Error!',
                        status: 'error',
                        description: 'Error: ' + error.message,
                        duration: 9000,
                        isClosable: true
                    })
                    setIsChoosing(true);
                } else {
                    toast({
                        title: 'Error!',
                        status: 'error',
                        description: 'Error: ' + error.message,
                        duration: 9000,
                        isClosable: true
                    })
                    setIsChoosing(true);
                }
            }
            updateRefreshingAction(dispatch, {
                status: false,
                message: "Complete",
            });
        }
    };

    return (
        <><>

            {/*Choose your side flow*/}

            {isChoosing &&
                <div className={'image-container-microbes'}>
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
                        {!state.walletWeb3Modal.connected &&
                            <Header/>}
                        {state.walletWeb3Modal.connected && isChoosing &&
                            <>
                                <Center>
                                    <Grid>
                                        <GridItem>
                                            <Box p='6'>
                                                <Image className='clickable' src="/images/Mutantz-Attack.png"
                                                       onClick={() => {
                                                           setIsMutantzFlow(true);
                                                           setIsAttack(true);
                                                           setIsChoosing(false);
                                                           setIsLoading(true);
                                                           fetchAmountOfMutantzInWallet().then(r => setMutantzInWallet(r));
                                                       }}/>
                                            </Box>
                                        </GridItem>
                                        <GridItem>
                                            <Box p='6'>
                                                <Image className='clickable' src="/images/Superz-Protect.png"
                                                       onClick={() => {
                                                           setIsTrooprzFlow(true);
                                                           setIsDefense(true);
                                                           setIsChoosing(false);
                                                           setIsLoading(true);
                                                           fetchAmountOfSuperTrooprzInWallet().then(r => setSuperTrooprzInWallet(r));
                                                       }}/>
                                            </Box>
                                        </GridItem>
                                    </Grid></Center></>}
                    </main>
                </div>}

            {/*Mutantz Attack Flow*/}

            {state.walletWeb3Modal.connected && !isChoosing && isAttack && isMutantzFlow && !isTrooprzFlow && !isDefense &&
                <div className={'image-container-mutantz'}>
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
                                    <Image src="/images/Mutant-Invasion-Graphic.png"/>
                                </Box>

                                {state.walletWeb3Modal.connected && state.refreshing.status && isMutantzFlow && !isChoosing && isAttack && isLoading &&
                                    <Box>
                                        <Center>
                                            <Text color={"white"}>Please be patient while we load your eligible
                                                Mutantz</Text>
                                        </Center><br/>
                                        <Center>
                                            <Spinner color={"white"}>
                                            </Spinner></Center>
                                    </Box>}
                                {state.walletWeb3Modal.connected && isMutantzFlow && !isChoosing && isAttack &&
                                    <Box w={'100%'}>
                                        <Center>
                                            <Text color={"white"}>Select max 1 Mutantz per turn</Text>
                                        </Center><br/>
                                        {state.walletWeb3Modal.connected && !state.refreshing.status && isMutantzFlow && !isSummary && !checkMutantz() &&
                                            <Center>
                                                <Text color={"white"}>
                                                    You don&lsquo;t seem to have any Mutantz.
                                                </Text>
                                            </Center>}
                                        <Center>
                                            <SimpleGrid columns={[2, 4]} spacing={[5, 10]}>
                                                {mutantzInWallet.map((token) => (
                                                    <Image
                                                        className="clickable"
                                                        key={token}
                                                        onClick={(e) => {
                                                            selected(e, token);
                                                        }}
                                                        boxSize='150px'
                                                        objectFit='cover'
                                                        src={`https://cdn.ebisusbay.com/proxy/https://bafybeib2gmwun7cuksemlaxdlujbwqsm5k6b6h3vq42fmhr5c4y63xik2q.ipfs.nftstorage.link/${token}.png`}
                                                        alt={`Mutantz id ${token}`}/>
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
                                                setIsSending(true);
                                                setIsLoading(false);
                                                sendMutantz();
                                                setIsChoosing(false);
                                            }}>
                                                Send Mutantz
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
                                                setIsMutantzFlow(false);
                                                setIsAttack(false);
                                                setIsChoosing(true);
                                                setTokensInWallet([]);

                                            }}>
                                                Back
                                            </Button>
                                        </Center><br/>
                                    </Box>}
                                {state.walletWeb3Modal.connected && state.refreshing.status && isMutantzFlow && isSending && isAttack && !isMutantzFlow && !isAttack &&
                                    <Box>
                                        <Center>
                                            <Text color={"white"}>Hang tight, your Mutantz are being sent off to
                                                attack!!</Text>
                                        </Center><br/>
                                        <Center>
                                            <Spinner color={"white"}></Spinner>
                                        </Center>
                                    </Box>}
                            </VStack>
                        </Center>
                    </main>
                </div>}

            {/*SuperTrooprz defend flow*/}

            {state.walletWeb3Modal.connected && !isChoosing && isDefense && isTrooprzFlow &&
                <div className={'image-container-super-trooprz'}>
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
                                    <Image src="/images/Superz-Protect.png"/>
                                </Box>

                                {state.walletWeb3Modal.connected && state.refreshing.status && isTrooprzFlow && !isChoosing && isDefense && isLoading &&
                                    <Box>
                                        <Center>
                                            <Text color={"white"}>Please be patient while we load your eligible
                                                SuperTrooprz</Text>
                                        </Center><br/>
                                        <Center>
                                            <Spinner color={"white"}>
                                            </Spinner></Center>
                                    </Box>}
                                {state.walletWeb3Modal.connected && isTrooprzFlow && !isChoosing && isDefense &&
                                    <Box w={'100%'}>
                                        <Center>
                                            <Text color={"white"}>Select max 1 SuperTroopr per turn</Text>
                                        </Center><br/>
                                        {state.walletWeb3Modal.connected && !state.refreshing.status && isTrooprzFlow && !isSummary && !checkSuperTrooprz() && isDefense &&
                                            <Center>
                                                <Text color={"white"}>
                                                    You don&lsquo;t seem to have any SuperTrooprz.
                                                </Text>
                                            </Center>}
                                        <Center>
                                            <SimpleGrid columns={[2, 4]} spacing={[5, 10]}>
                                                {superTrooprzInWallet.map((token) => (
                                                    <Image
                                                        className="clickable"
                                                        key={token}
                                                        onClick={(e) => {
                                                            selectedSuperTroopr(e, token);
                                                        }}
                                                        boxSize='150px'
                                                        objectFit='cover'
                                                        src={`https://cdn.ebisusbay.com/proxy/https://metadata.trooprz.army/super-trooprz/${token}.png`}
                                                        alt={`SuperTrooprz id ${token}`}/>
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
                                                sessionStorage.setItem("superTrooprzList", JSON.stringify(Array.from(superTrooprzList)));
                                                setIsSending(true);
                                                setIsLoading(false);
                                                sendSuperTrooprz();
                                            }}>
                                                Send SuperTrooprz
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
                                                setIsDefense(false);
                                                setIsChoosing(true);
                                                setTokensInWallet([]);
                                            }}>
                                                Back
                                            </Button>
                                        </Center><br/>
                                    </Box>}

                                {state.walletWeb3Modal.connected && isSummary && !isTrooprzFlow && !isChoosing && isDefense &&
                                    <Box>
                                        <Center>
                                            <Text color={"white"}>You are about to send SuperTrooprz off to
                                                defend!</Text><br/>
                                        </Center>
                                        <Center>
                                            <Text color={"white"}>Here&lsquo;s an overview of SuperTrooprz
                                                used for this:</Text>
                                        </Center>
                                        <Center>
                                            <SimpleGrid columns={[2, 5]} spacing={[5, 10]}>
                                                {getSuperTrooprzFromStorage().map((token) => (
                                                    <Image
                                                        key={token}
                                                        boxSize='150px'
                                                        objectFit='cover'
                                                        src={`https://cdn.ebisusbay.com/proxy/https://metadata.trooprz.army/super-trooprz/${token}.png`}
                                                        alt={`SuperTrooprz id ${token}`}/>))}
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
                                                setIsSending(true);
                                                sendSuperTrooprz();
                                            }}>
                                                Send SuperTrooprz
                                            </Button>
                                        </Center><br/>
                                    </Box>}
                                {state.walletWeb3Modal.connected && state.refreshing.status && !isTrooprzFlow && isSending && isDefense &&
                                    <Box>
                                        <Center>
                                            <Text color={"white"}>Hang tight, your SuperTrooprz are being sent
                                                off to
                                                defend!!</Text>
                                        </Center><br/>
                                        <Center>
                                            <Spinner color={"white"}></Spinner>
                                        </Center>
                                    </Box>}
                                {state.walletWeb3Modal.connected && !isTrooprzFlow && isSummary && isDefense &&
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
                                                    window.location.reload();
                                                }}>
                                                    Send more SuperTrooprz
                                                </Button>
                                            </Center>}
                                    </Box>}
                            </VStack>
                        </Center>
                    </main>
                </div>}

            {/*check id flow*/}
            {state.walletWeb3Modal.connected && isMutantzFlow && !isChoosing && !isDefense &&
                <Box>
                    <Center>
                        <Text color={"white"}>Enter a Mutantz ID here to check if it is eligible to attack. A
                            popup will
                            appear showing the
                            result.</Text>
                    </Center><br/>
                    <Center>
                        <NumberInput bg='white' width="200px">
                            <NumberInputField value={mutantzId}
                                              onChange={(e) => {
                                                  setMutantzId(e.target.value);
                                              }}/>
                        </NumberInput><br/><br/>
                    </Center><br/>
                    <Center>
                        <Button size='md'
                                height='48px'
                                width='220px'
                                border='2px'
                                bg='#C2DCA5'
                                borderColor='#4E6840'
                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                            isMutantzTokenEligible(mutantzId);
                        }}>
                            Check id
                        </Button></Center><br/>
                </Box>
            }
            {state.walletWeb3Modal.connected && isTrooprzFlow && !isChoosing && isDefense &&
                <Box>
                    <Center>
                        <Text color={"white"}>Enter an SuperTrooprz ID here to check if it is eligible to
                            defend. A
                            popup
                            will appear showing the
                            result.</Text>
                    </Center><br/>
                    <Center>
                        <NumberInput bg='white' width="200px">
                            <NumberInputField value={trooprzId}
                                              onChange={(e) => {
                                                  setTrooprzId(e.target.value);
                                              }}/>
                        </NumberInput><br/><br/>
                    </Center><br/>
                    <Center>
                        <Button size='md'
                                height='48px'
                                width='220px'
                                border='2px'
                                bg='#C2DCA5'
                                borderColor='#4E6840'
                                _hover={{bg: '#D6E9CF'}} onClick={() => {
                            isSuperTrooprzTokenEligible(trooprzId);
                        }}>
                            Check id
                        </Button></Center><br/>
                </Box>
            }
        </>


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
        </>
    );
}

export default Home;
