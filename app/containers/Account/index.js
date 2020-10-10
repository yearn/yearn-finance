import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { useInjectReducer } from 'utils/injectReducer';
import { useDispatch, useSelector } from 'react-redux';
import Button from 'components/Button';
import { makeSelectDarkMode } from 'containers/ThemeProvider/selectors';
import reducer from './reducer';
import { initOnboard } from './services';
import ConnectedAccount from './connectedAccount';
import * as actions from './actions';

const ConnectButtonWrapper = styled.div``;

export default function Account() {
  const dispatch = useDispatch();
  const darkMode = useSelector(makeSelectDarkMode());

  useInjectReducer({ key: 'account', reducer });

  const [address, setAddress] = useState(null);
  const [wallet, setWallet] = useState({});
  const [onboard, setOnboard] = useState(null);

  const initializeWallet = () => {
    const selectWallet = newWallet => {
      if (newWallet.provider) {
        setWallet(newWallet);
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
    if (onboard) {
      dispatch(actions.setAccount(onboard));
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

  const connectWallet = () => {
    onboard.walletSelect();
  };

  let content;
  if (wallet.provider && address) {
    content = <ConnectedAccount onClick={connectWallet} address={address} />;
  } else {
    content = (
      <ConnectButtonWrapper>
        <Button onClick={connectWallet}>
          <FormattedMessage id="account.connect" />
        </Button>
      </ConnectButtonWrapper>
    );
  }

  return <React.Fragment>{content}</React.Fragment>;
}
