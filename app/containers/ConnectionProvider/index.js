import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { useSelector, useDispatch } from 'react-redux';
import { selectDarkMode } from 'containers/ThemeProvider/selectors';
import { useInjectReducer } from 'utils/injectReducer';
import { initOnboard, initNotify } from './services';
import { connectionConnected, accountUpdated } from './actions';
import ConnectionContext from './context';
import reducer from './reducer';

export default function ConnectionProvider(props) {
  useInjectReducer({ key: 'connection', reducer });
  const { children } = props;
  const darkMode = useSelector(selectDarkMode());
  const dispatch = useDispatch();
  const [account, setAccount] = useState(null);
  const [wallet, setWallet] = useState({});
  const [onboard, setOnboard] = useState(null);
  const [notify, setNotify] = useState(null);
  const [web3, setWeb3] = useState(null);

  const dispatchConnectionConnected = () => {
    dispatch(connectionConnected(account));
  };

  const initializeWallet = () => {
    const selectWallet = async (newWallet) => {
      if (newWallet.provider) {
        const newWeb3 = new Web3(newWallet.provider);
        newWeb3.eth.net.isListening().then(dispatchConnectionConnected);
        setWallet(newWallet);

        setWeb3(newWeb3);
        window.localStorage.setItem('selectedWallet', newWallet.name);
      } else {
        setWallet({});
      }
    };
    const onboardConfig = {
      address: setAccount,
      wallet: selectWallet,
    };
    const newOnboard = initOnboard(onboardConfig, darkMode);
    setNotify(initNotify(darkMode));
    setOnboard(newOnboard);
  };

  const accountChanged = () => {
    if (account) {
      dispatch(accountUpdated(account, web3));
    }
  };

  const reconnectWallet = () => {
    const previouslySelectedWallet = window.localStorage.getItem(
      'selectedWallet',
    );
    if (previouslySelectedWallet && onboard) {
      onboard.walletSelect(previouslySelectedWallet);
    }
  };

  const changeDarkMode = () => {
    if (onboard) {
      onboard.config({ darkMode });
    }
  };

  useEffect(initializeWallet, []);
  useEffect(reconnectWallet, [onboard]);
  useEffect(accountChanged, [account]);
  useEffect(changeDarkMode, [darkMode]);

  const selectWallet = async () => {
    // Open wallet modal
    const selectedWallet = await onboard.walletSelect();

    // User quit modal
    if (!selectedWallet) {
      return;
    }

    // Wait for wallet selection initialization
    const readyToTransact = await onboard.walletCheck();
    if (readyToTransact) {
      // Fetch active wallet and connect
      const currentState = onboard.getState();
      const activeWallet = currentState.wallet;
      activeWallet.connect(onboard);
    }
  };

  return (
    <ConnectionContext.Provider
      value={{ onboard, wallet, account, selectWallet, web3, notify }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}
