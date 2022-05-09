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
import {defaultQueryResults, defaultWalletWeb3Modal} from "../../store/interfaces";
import {
    Button,
    Center,
} from '@chakra-ui/react'

import Web3Modal from "web3modal";

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
            const croBalance = await utils.getCroBalance(
                newWallet.provider,
                newWallet.signer,
                newWallet.address
            );
            const erc20Balance = await utils.getBalance(
                newWallet.provider,
                newWallet.address
            );
                updateWalletWeb3ModalAction(dispatch, newWallet);
                updateQueryResultsAction(dispatch, {
                    ...defaultQueryResults,
                    croBalance: croBalance,
                    erc20Balance: erc20Balance,
                    provider: newWallet.provider,
                    signer: newWallet.signer
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
