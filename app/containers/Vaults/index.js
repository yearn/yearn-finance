import React from 'react';
import styled, { css } from 'styled-components';
import Accordion from 'react-bootstrap/Accordion';
import ColumnList from 'components/Vault/columns';

import { selectVaults } from 'containers/Vaults/selectors';
import { selectDevMode } from 'containers/DevMode/selectors';
import {
  // selectWatchedContractAddresses,
  selectLocation,
} from 'containers/App/selectors';
import { useSelector } from 'react-redux';
import Vault from 'components/Vault';
import VaultsNavLinks from 'components/VaultsNavLinks';
// import VaultDev from 'components/VaultDev';
import AddVault from 'components/AddVault';

import { matchPath } from 'react-router';

const Wrapper = styled.div`
  width: 1088px;
  margin: 0 auto;
`;

const ColumnHeader = styled.div`
  margin-bottom: 10px;
  padding-top: 20px;
  font-size: 17px;
  text-transform: uppercase;
`;

const DevHeader = styled.div`
  opacity: ${props => (props.devMode ? 1 : 0)};
  transition: opacity 100ms ease-in, margin-top 100ms ease-out;
  margin-top: -50px;
  pointer-events: none;
  ${props =>
    props.devMode &&
    css`
      margin-top: 30px;
      color: black;
      transition: opacity 100ms ease-in, margin-top 100ms ease-out;
      pointer-events: inherit;
    `}
`;

const Vaults = () => {
  const vaults = useSelector(selectVaults());
  // const vaultsWithContractData = useContractData(vaults)
  const devMode = useSelector(selectDevMode());
  // const contractAddresses = useSelector(selectWatchedContractAddresses());
  const location = useSelector(selectLocation());
  const { pathname } = location;
  // const vaultContractAddresses = contractAddresses.vaults;
  // const localVaultContractAddresses = contractAddresses.localVaults;

  const routeIsDevelop = matchPath(pathname, {
    path: '/vaults/develop',
    exact: true,
    strict: false,
  });

  const showDevVaults = routeIsDevelop && devMode;

  // const tokenContracts = useSelector(selectContracts('tokens'));
  // const localVaultContracts = useDrizzleContracts('localVaults');
  // useRequireConnection();
  // const web3 = useWeb3();
  // const notify = useNotify();
  // const onboard = useOnboard();
  // const address = useAddress();
  // get current account
  // if (!web3 || !address || !onboard) {
  //   return;
  // }
  // console.log('adrv, ', address, web3, onboard);
  // const accounts = await web3.eth.getAccounts();
  // console.log('accts', accounts);
  // await onboard.walletCheck();
  // const address1 = '0x19A329742EC1c25EFe894B5F81BDfd1D44A2C85e';
  // send the transaction using web3.js and get the hash
  // web3.eth
  //   .sendTransaction({
  //     from: address,
  //     to: address,
  //     value: '000000000000001',
  //   })
  //   .on('transactionHash', function(hash) {
  //     // pass the hash to notify to track it
  //     notify.hash(hash);
  //   });

  const renderVault = vault => <Vault vault={vault} key={vault.address} />;
  // const renderVaultDev = address => (
  //   <VaultDev address={address} key={address} />
  // );
  let vaultRows = _.map(vaults, renderVault);
  if (showDevVaults) {
    // vaultRows = _.map(localVaultContractAddresses, renderVaultDev);
    vaultRows = <div>cavkle</div>;
  }

  return (
    <Wrapper>
      <DevHeader devMode={devMode}>
        <VaultsNavLinks />
        <AddVault devVaults={showDevVaults} />
      </DevHeader>
      <ColumnList>
        <ColumnHeader>Asset</ColumnHeader>
        <ColumnHeader>Deposited</ColumnHeader>
        <ColumnHeader>Vault Assets</ColumnHeader>
        <ColumnHeader>Growth</ColumnHeader>
        <ColumnHeader>Available to deposit</ColumnHeader>
      </ColumnList>
      <Accordion>{vaultRows}</Accordion>
    </Wrapper>
  );
};

Vaults.whyDidYouRender = true;
export default Vaults;
