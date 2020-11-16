import React, { memo } from 'react';
import { compose } from 'redux';
import styled, { css } from 'styled-components';
import Accordion from 'react-bootstrap/Accordion';
import VaultsHeader from 'components/VaultsHeader';
import VaultsHeaderDev from 'components/VaultsHeaderDev';
import { selectContracts } from 'containers/App/selectors';
import { selectDevMode } from 'containers/DevMode/selectors';
import { useSelector } from 'react-redux';
import Vault from 'components/Vault';
import VaultsNavLinks from 'components/VaultsNavLinks';
import { useShowDevVaults } from 'containers/Vaults/hooks';
import AddVault from 'components/AddVault';

const Wrapper = styled.div`
  width: 1088px;
  margin: 0 auto;
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
  const vaults = useSelector(selectContracts('vaults'));
  const localContracts = useSelector(selectContracts('localContracts'));
  const devMode = useSelector(selectDevMode());
  const showDevVaults = useShowDevVaults();

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

  const renderVault = vault => (
    <Vault vault={vault} key={vault.address} showDevVaults={showDevVaults} />
  );
  let vaultRows = _.map(vaults, renderVault);
  let columnHeader;
  if (showDevVaults) {
    vaultRows = _.map(localContracts, renderVault);
    columnHeader = <VaultsHeaderDev />;
  } else {
    columnHeader = <VaultsHeader />;
  }

  return (
    <Wrapper>
      <DevHeader devMode={devMode}>
        <VaultsNavLinks />
        <AddVault devVaults={showDevVaults} />
      </DevHeader>
      {columnHeader}
      <Accordion>{vaultRows}</Accordion>
    </Wrapper>
  );
};

Vaults.whyDidYouRender = true;
export default compose(memo)(Vaults);
