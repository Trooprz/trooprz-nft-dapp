import * as React from "react";

import {Store} from "../../store/store-reducer";
import * as utils from "../../helpers/utils";

import * as walletWeb3Modal from "../../helpers/web3modal-connect"
import providerOptions from "../../config/ProviderOptions"

import {
    updateQueryResultsAction,
    updateRefreshingAction,
    updateWalletWeb3ModalAction,
} from "../../store/actions";
import {defaultQueryResults} from "../../store/interfaces";
import {
    Box,
    Button,
    Center, Image, Text,
} from '@chakra-ui/react'

import Web3Modal from "web3modal";
import * as config from "../../config/config";

declare global {
    interface Window {
        ethereum: any;
    }
}

interface IProps {
}

const Header: React.FC<IProps> = () => {
    const {state, dispatch} = React.useContext(Store);

    let web3Modal;
    if (typeof window !== 'undefined') {
        web3Modal = new Web3Modal({
            providerOptions
        })
    }

    const handleConnect = async () => {
        let newWallet: any;
        await web3Modal.clearCachedProvider();
        localStorage.clear();
        newWallet = await walletWeb3Modal.connect();
        if (newWallet.connected) {
            const trooprzBalance = await utils.getTrooprzBalance(
                newWallet.provider,
                newWallet.address
            );
            const microbesBalance = await utils.getMicrobesBalance(
                newWallet.provider,
                newWallet.address
            );
            const mutantzBalance = await utils.getMutantzBalance(
                newWallet.provider,
                newWallet.address
            );
            const superTrooprzBalance = await utils.getSuperTrooprzBalance(
                newWallet.provider,
                newWallet.address
            );
            const approved = await utils.checkIfApprovedForAll(
                newWallet.provider,
                newWallet.address,
                config.configVars.erc20.address);

            updateWalletWeb3ModalAction(dispatch, newWallet);
            updateQueryResultsAction(dispatch, {
                ...defaultQueryResults,
                trooprzBalance: trooprzBalance,
                microbesBalance: microbesBalance,
                mutantzBalance: mutantzBalance,
                superTrooprzBalance: superTrooprzBalance,
                provider: newWallet.provider,
                signer: newWallet.signer,
                approved: approved
            });
        }
        updateRefreshingAction(dispatch, {
            status: false,
            message: "Complete",
        });
    }

    const renderLoginbutton = () => {
        if (!state.walletWeb3Modal.connected) {
            return (
                <div>
                    <Center>
                        <Box>
                            <Text align={"center"} fontSize={'6xl'} as={'b'}>IT&apos;S TIME FOR BATTLE!</Text>
                        </Box>
                    </Center>
                    <Center>

                        <Button size='md'
                                height='48px'
                                width='200px'
                                border='2px'
                                bg='#C2DCA5'
                                borderColor='#4E6840'
                                _hover={{bg: '#D6E9CF'}} onClick={() => handleConnect()}>Connect</Button>
                    </Center>
                </div>
            );
        }
    };

    return (
        <div>
            {renderLoginbutton()}
        </div>
    );
};

export default Header;
