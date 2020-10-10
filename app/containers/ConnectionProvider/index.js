import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { useSelector } from 'react-redux';
import { makeSelectDarkMode } from 'containers/ThemeProvider/selectors';
import { initOnboard } from './services';
import Context from './context';

export default function ConnectionProvider(props) {
  const { children } = props;
  const darkMode = useSelector(makeSelectDarkMode());

  const [address, setAddress] = useState(null);
  const [wallet, setWallet] = useState({});
  const [onboard, setOnboard] = useState(null);
  const [web3, setWeb3] = useState(null);

  const initializeWallet = () => {
    const selectWallet = newWallet => {
      if (newWallet.provider) {
        setWallet(newWallet);
        setWeb3(new Web3(newWallet.provider));
        window.localStorage.setItem('selectedWallet', newWallet.name);
      } else {
        setWallet({});
      }
    };
    const onboardConfig = {
      address: setAddress,
      wallet: selectWallet,
    };
    const newOnboard = initOnboard(onboardConfig, darkMode);
    setOnboard(newOnboard);
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
  useEffect(changeDarkMode, [darkMode]);

  const selectWallet = () => {
    onboard.walletSelect();
  };

  return (
    <Context.Provider value={{ onboard, wallet, address, selectWallet, web3 }}>
      {children}
    </Context.Provider>
  );
}
