import * as React from "react";

import { Store } from "../../store/store-reducer";
import * as utils from "../../helpers/utils";

// These are the wallet SDK helpers
import * as walletMetamask from "../../helpers/wallet-metamask";
import * as walletDefiwallet from "../../helpers/wallet-defiwallet";
import * as walletConnect from "../../helpers/wallet-connect";

import {
  updateQueryResultsAction,
  updateRefreshingAction,
  updateWalletAction,
} from "../../store/actions";
import { defaultQueryResults, defaultWallet } from "../../store/interfaces";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider, Button,
} from '@chakra-ui/react'

declare global {
  interface Window {
    ethereum: any;
  }
}

interface IProps {}

const Header: React.FC<IProps> = () => {
  const { state, dispatch } = React.useContext(Store);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Uncomment this to auto-connect in MetaMask in-app browser
  // React.useEffect(() => {
  //   async function initialLoad() {
  //     activate(injectedConnector);
  //   }
  //   initialLoad();
  // }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickConnect = async (option: string) => {
    updateRefreshingAction(dispatch, {
      status: true,
      message: "Connecting wallet...",
    });
    let newWallet: any;
    switch (option) {
      // Wallet injected within browser (MetaMask)
      case "metamask-injected":
        newWallet = await walletMetamask.connect();
        break;
      // Crypto.com DeFi Wallet Extension (browser)
      case "defiwallet":
        newWallet = await walletDefiwallet.connect();
        break;
      // Crypto.com DeFi Wallet mobile app (via Wallet Connect)
      case "wallet-connect":
        newWallet = await walletConnect.connect();
        break;
      default:
        newWallet = await walletMetamask.connect();
    }
    // If wallet is connected, query the blockchain and update stored values
    if (newWallet.connected) {
      const lastBlockNumber = await utils.getLastBlockNumber(
        newWallet.serverWeb3Provider
      );
      const croBalance = await utils.getCroBalance(
        newWallet.serverWeb3Provider,
        newWallet.address
      );
      const erc20Balance = await utils.getBalance(
        newWallet.serverWeb3Provider,
        newWallet.address
      );
      updateWalletAction(dispatch, newWallet);
      updateQueryResultsAction(dispatch, {
        ...defaultQueryResults,
        lastBlockNumber: lastBlockNumber,
        croBalance: croBalance,
        erc20Balance: erc20Balance,
      });
    }
    updateRefreshingAction(dispatch, {
      status: false,
      message: "Complete",
    });
    handleClose();
  };

  // Disconnect wallet clears the data stored by the front-end app
  // Some wallets can be asked to actually disconnect from the app, but most cannot.
  // The recommended secure approach is for the user to disconnect their wallet
  // themselves in the wallet app or browser extension.
  const disconnectWallet = async () => {
    updateRefreshingAction(dispatch, {
      status: true,
      message: "Disconnecting wallet...",
    });
    switch (state.wallet.walletProviderName) {
      case "defiwallet":
        await state.wallet.wcConnector.deactivate();
        break;
      default:
    }
    updateRefreshingAction(dispatch, {
      status: false,
      message: "Complete",
    });
    updateWalletAction(dispatch, { ...defaultWallet });
    updateQueryResultsAction(dispatch, { ...defaultQueryResults });
  };

  const renderLoginbutton = () => {
    if (state.wallet.connected) {
      return (
        <button color="inherit" onClick={disconnectWallet}>
          Disconnect
        </button>
      );
    } else {
      return (
        <div>
          <Menu>
            <MenuButton as={Button}>Connect</MenuButton>
            <MenuList>
              <MenuItem onClick={() => {
                handleClickConnect("metamask-injected");
              }}>Metamask</MenuItem>
              <MenuItem onClick={() => {
                handleClickConnect("wallet-connect");
              }}>Wallet-Connect</MenuItem>
              <MenuItem onClick={() => {
                handleClickConnect("defiwallet");
              }}>Defi Wallet</MenuItem>
            </MenuList>
          </Menu>
        </div>
      );
    }
  };

  return (
    <div>
            <p>
              Trooprz Minting Platform
            </p>
            {renderLoginbutton()}
    </div>
  );
};

export default Header;
