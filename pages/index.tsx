import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React, {useEffect, useState} from "react";
import {Store} from "../store/store-reducer";
import {updateRefreshingAction} from "../store/actions";
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
import Header from "./mint/Header";
import Web3Modal from "web3modal";
import providerOptions from "../config/ProviderOptions";
import * as config from "../config/config";
import {string} from "prop-types";

interface IProps {
}

const Home: React.FC<IProps> = () => {
    const {state, dispatch} = React.useContext(Store);
    const [tokensInWallet, setTokensInWallet] = useState([]);
    const [mutantzInWallet, setMutantzInWallet] = useState([]);
    const [obsidianRingsInWallet, setObsidianRingsInWallet] = useState([]);
    const [icyWhiteRingsInWallet, setIcyWhiteRingsInWallet] = useState([]);
    const [rosegoldRingsInWallet, setRosegoldRingsInWallet] = useState([]);
    const [royalIndigoRingsInWallet, setRoyalIndigoRingsInWallet] = useState([]);
    const [jadeGreenRingsInWallet, setJadeGreenRingsInWallet] = useState([]);
    const [rubyRedRingsInWallet, setRubyRedRingsInWallet] = useState([]);
    const [midnightBlueRingsInWallet, setMidnightBlueRingsInWallet] = useState([]);
    const [superTrooprzInWallet, setSuperTrooprzInWallet] = useState([]);
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
                description: "You can only send 1 NFT at a time into battle!",
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
                description: "You can only send 1 NFT at a time into battle!",
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

    const fetchAmountOfRingsInWallet = async (ringColor: string) => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });
        console.log(ringColor)
        const data = await utils.getRingsInWallet(state.walletWeb3Modal.provider, state.walletWeb3Modal.address, state.queryResults.ringsBalance, ringColor);

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
                    window.location.reload()
                } else {
                    toast({
                        title: 'Error!',
                        status: 'error',
                        description: 'Error: ' + error.message,
                        duration: 9000,
                        isClosable: true
                    })
                    window.location.reload()
                }
            }
            updateRefreshingAction(dispatch, {
                status: false,
                message: "Complete",
            });
        }
    }

    const sendRings = async () => {
        updateRefreshingAction(dispatch, {
            status: true,
            message: "Sending transaction...",
        });
        const ringsWriteContractInstance = await utils.getRingsWriteContractInstance(
            state.walletWeb3Modal.provider,
        );
        if (checkAmountOfSuperTrooprzSelected()) {
            try {
                const tx = await ringsWriteContractInstance["transferFrom"](state.walletWeb3Modal.address, config.configVars.erc20.protectAddress, tokenId);
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
                    window.location.reload()
                } else {
                    toast({
                        title: 'Error!',
                        status: 'error',
                        description: 'Error: ' + error.message,
                        duration: 9000,
                        isClosable: true
                    })
                    window.location.reload()
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
                                                           fetchAmountOfRingsInWallet('obsidian').then(r => {
                                                               setObsidianRingsInWallet(r);
                                                               console.log('RINGS: ' + obsidianRingsInWallet)
                                                           });
                                                           fetchAmountOfRingsInWallet('icyWhite').then(r => setIcyWhiteRingsInWallet(r));
                                                           fetchAmountOfRingsInWallet('roseGold').then(r => setRosegoldRingsInWallet(r));
                                                           fetchAmountOfRingsInWallet('royalIndigo').then(r => setRoyalIndigoRingsInWallet(r));
                                                           fetchAmountOfRingsInWallet('jadeGreen').then(r => setJadeGreenRingsInWallet(r));
                                                           fetchAmountOfRingsInWallet('rubyRed').then(r => setRubyRedRingsInWallet(r));
                                                           fetchAmountOfRingsInWallet('midnightBlue').then(r => setMidnightBlueRingsInWallet(r));
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
                                {state.walletWeb3Modal.connected && state.refreshing.status && isMutantzFlow && !isChoosing && isAttack && isLoading &&
                                    <Center>
                                        <Box>
                                            <Center>
                                                <Text align={"center"} color={"white"}>Please be patient while we load
                                                    your eligible
                                                    Rings</Text>
                                            </Center><br/>
                                            <Center>
                                                <Spinner color={"white"}>
                                                </Spinner></Center>
                                        </Box></Center>}
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
                                            <SimpleGrid columns={[4, 4]} spacing={[5, 10]}>
                                                {obsidianRingsInWallet.map((token) => (
                                                    <Image
                                                        className="clickable"
                                                        key={token}
                                                        onClick={(e) => {
                                                            selected(e, token);
                                                        }}
                                                        boxSize='150px'
                                                        objectFit='cover'
                                                        src={`https://cdn.ebisusbay.com/QmfNrtmewoxCwKLqtjC5PnpPk8ssT5w1oqnYTHTNrbwhE4/obsidian.mp4/ik-thumbnail.jpg`}
                                                        alt={`Rings id ${token}`}/>
                                                ))}
                                                {icyWhiteRingsInWallet.map((token) => (
                                                    <Image
                                                        className="clickable"
                                                        key={token}
                                                        onClick={(e) => {
                                                            selected(e, token);
                                                        }}
                                                        boxSize='150px'
                                                        objectFit='cover'
                                                        src={`https://cdn.ebisusbay.com/QmfNrtmewoxCwKLqtjC5PnpPk8ssT5w1oqnYTHTNrbwhE4/icy.mp4/ik-thumbnail.jpg`}
                                                        alt={`Rings id ${token}`}/>
                                                ))}
                                                {rosegoldRingsInWallet.map((token) => (
                                                    <Image
                                                        className="clickable"
                                                        key={token}
                                                        onClick={(e) => {
                                                            selected(e, token);
                                                        }}
                                                        boxSize='150px'
                                                        objectFit='cover'
                                                        src={`https://cdn.ebisusbay.com/QmfNrtmewoxCwKLqtjC5PnpPk8ssT5w1oqnYTHTNrbwhE4/rose.mp4/ik-thumbnail.jpg`}
                                                        alt={`Rings id ${token}`}/>
                                                ))}
                                                {royalIndigoRingsInWallet.map((token) => (
                                                    <Image
                                                        className="clickable"
                                                        key={token}
                                                        onClick={(e) => {
                                                            selected(e, token);
                                                        }}
                                                        boxSize='150px'
                                                        objectFit='cover'
                                                        src={`https://cdn.ebisusbay.com/QmfNrtmewoxCwKLqtjC5PnpPk8ssT5w1oqnYTHTNrbwhE4/indigo.mp4/ik-thumbnail.jpg`}
                                                        alt={`Rings id ${token}`}/>
                                                ))}
                                                {jadeGreenRingsInWallet.map((token) => (
                                                    <Image
                                                        className="clickable"
                                                        key={token}
                                                        onClick={(e) => {
                                                            selected(e, token);
                                                        }}
                                                        boxSize='150px'
                                                        objectFit='cover'
                                                        src={`https://cdn.ebisusbay.com/QmfNrtmewoxCwKLqtjC5PnpPk8ssT5w1oqnYTHTNrbwhE4/jade.mp4/ik-thumbnail.jpg`}
                                                        alt={`Rings id ${token}`}/>
                                                ))}
                                                {rubyRedRingsInWallet.map((token) => (
                                                    <Image
                                                        className="clickable"
                                                        key={token}
                                                        onClick={(e) => {
                                                            selected(e, token);
                                                        }}
                                                        boxSize='150px'
                                                        objectFit='cover'
                                                        src={`https://cdn.ebisusbay.com/QmfNrtmewoxCwKLqtjC5PnpPk8ssT5w1oqnYTHTNrbwhE4/ruby.mp4/ik-thumbnail.jpg`}
                                                        alt={`Rings id ${token}`}/>
                                                ))}
                                                {midnightBlueRingsInWallet.map((token) => (
                                                    <Image
                                                        className="clickable"
                                                        key={token}
                                                        onClick={(e) => {
                                                            selected(e, token);
                                                        }}
                                                        boxSize='150px'
                                                        objectFit='cover'
                                                        src={`https://cdn.ebisusbay.com/QmfNrtmewoxCwKLqtjC5PnpPk8ssT5w1oqnYTHTNrbwhE4/blue.mp4/ik-thumbnail.jpg`}
                                                        alt={`Rings id ${token}`}/>
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
                                                Create Ring
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
                                    <Center>
                                        <Box>
                                            <Center>
                                                <Text align={"center"} color={"white"}>Please be patient while we load
                                                    your eligible
                                                    SuperTrooprz</Text>
                                            </Center><br/>
                                            <Center>
                                                <Spinner color={"white"}>
                                                </Spinner></Center>
                                        </Box></Center>}
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
