import React, { useEffect } from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Switch, Route } from 'react-router-dom';
import {
  useWeb3,
  useRequireConnection,
} from 'containers/ConnectionProvider/hooks';
// import {
//   makeSelectOnboard,
//   makeSelectAccount,
// } from 'containers/Account/selectors';
import { useSelector } from 'react-redux';

const Wrapper = styled.div``;

export default function Main(props) {
  useRequireConnection();
  const web3 = useWeb3();
  console.log('abc', web3);
  // const onboard = useSelector(makeSelectOnboard());
  // const account = useSelector(makeSelectAccount());
  // if (onboard) {
  //   const getAccount = async () => {
  //     // await onboard.walletSelect();
  //     // const account = await onboard.getState();
  //     console.log('acct', account);
  //   };
  //   getAccount();
  // }
  return <Wrapper>lil vailt</Wrapper>;
}
