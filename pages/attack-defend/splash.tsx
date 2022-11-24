// import Head from "next/head";
// import styles from "../../styles/Home.module.css";
// import Header from "../mint/Header";
// import React, {useState} from "react";
// import {Store} from "../../store/store-reducer";
// import {Box, Center, Image, ListItem, Text, UnorderedList, VStack} from "@chakra-ui/react";
// import {defaultQueryResults, defaultWalletWeb3Modal} from "../store/interfaces";
//
//
// interface IProps {
// }
//
// const Splash: React.FC<IProps> = () => {
//     const {state, dispatch} = React.useContext(Store);
// return (
//     <div className={'image-container-mutantz'}>
//     <Head>
//         <title>Troopz dApp</title>
//         <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate"/>
//         <meta httpEquiv="Pragma" content="no-cache"/>
//         <meta httpEquiv="Expires" content="0"/>
//         <meta name="description" content="Troopz dApp"/>
//         <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//         <link rel="icon" href="/favicon.ico"/>
//     </Head>
//     <main className={styles.main}>
//         {!state.walletWeb3Modal.connected &&
//             <Header/>
//         }
//         {state.walletWeb3Modal.connected && isChoosing &&
//             <><Box w="100%" borderBottom='1px solid' borderColor='#4E6840' borderStyle='dashed'>
//
//
//                 <><Center><Text fontSize="5xl" color={"white"}>
//                     Pew! Pew! Pew!
//                 </Text></Center>
//                     <Center>
//                         <UnorderedList color={"white"}>
//                             <ListItem>Select your team!</ListItem>
//                         </UnorderedList></Center>
//                 </>
//             </Box><Box>
//                 <Image src="/images/Mutant-Invasion-Graphic-Choice.png" onClick={() => {setIsMutantzFlow(true); setIsChoosing(false); fetchAmountOfMutantzInWallet().then(r => setTokensInWallet(r))}} />
//                 <Image src="/images/Super-Trooprz-Graphic-Choice.png" onClick={() => setIsTrooprzFlow(false)} />
//             </Box></>}
//         <Center>
//             <VStack>
//                 {!isChoosing && isMutantzFlow &&
//                     <Box w="60%">
//                         <Image src="/images/Mutant-Invasion-Graphic.png"/>
//                     </Box>
//                 }
//                 {/*{state.walletWeb3Modal.connected && !isMutantzFlow && !isSummary &&*/}
//                 {/*    <Box>*/}
//                 {/*        <Center>*/}
//                 {/*            <Text color={"white"}>What do you want to do?</Text>*/}
//                 {/*        </Center>*/}
//                 {/*        <Center>*/}
//                 {/*            <Button size='md'*/}
//                 {/*                    height='48px'*/}
//                 {/*                    width='220px'*/}
//                 {/*                    border='2px'*/}
//                 {/*                    bg='#C2DCA5'*/}
//                 {/*                    borderColor='#4E6840'*/}
//                 {/*                    _hover={{bg: '#D6E9CF'}} onClick={() => {*/}
//                 {/*                setIsMutantzFlow(true);*/}
//                 {/*                fetchAmountOfMutantzInWallet().then(r => setTokensInWallet(r))*/}
//                 {/*            }}>*/}
//                 {/*                Start selecting Mutantz*/}
//                 {/*            </Button></Center><br/>*/}
//                 {/*    </Box>*/}
//                 {/*}*/}
//
//             </VStack>
//         </Center>
//     </main>
//     </div>);
//     }
// export default Splash;
