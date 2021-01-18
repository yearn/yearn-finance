import React, { useContext } from 'react';
import styled, { css } from 'styled-components';
import Accordion from 'react-bootstrap/Accordion';
import VaultsHeader from 'components/VaultsHeader';
import VaultsHeaderDev from 'components/VaultsHeaderDev';
import {
  selectContractsByTag,
  selectOrderedVaults,
} from 'containers/App/selectors';
import { useSelector } from 'react-redux';
import Vault from 'components/Vault';
import VaultsNavLinks from 'components/VaultsNavLinks';
import { useShowDevVaults } from 'containers/Vaults/hooks';
import AddVault from 'components/AddVault';
import AccordionContext from 'react-bootstrap/AccordionContext';

const Wrapper = styled.div`
  width: 1088px;
  margin: 0 auto;
`;

const Warning = styled.div`
  display: table;
  font-size: 29px;
  margin: 0 auto;
  margin-top: 50px;
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
  const devMode = true;
  const showDevVaults = useShowDevVaults();

  let columnHeader;
  if (showDevVaults) {
    columnHeader = <VaultsHeaderDev />;
  } else {
    columnHeader = <VaultsHeader />;
  }

  let warning;
  if (showDevVaults) {
    warning = <Warning>Experimental vaults. Use at your own risk.</Warning>;
  }
  return (
    <Wrapper>
      <DevHeader devMode={devMode}>
        <VaultsNavLinks />
        <AddVault devVaults={showDevVaults} />
      </DevHeader>
      {warning}
      {columnHeader}
      <Accordion>
        <VaultsWrapper showDevVaults={showDevVaults} />
      </Accordion>
    </Wrapper>
  );
};

const VaultsWrapper = props => {
  const { showDevVaults } = props;
  const orderedVaults = useSelector(selectOrderedVaults);
  const localContracts = useSelector(selectContractsByTag('localContracts'));
  const currentEventKey = useContext(AccordionContext);
  const renderVault = vault => (
    <Vault
      vault={vault}
      key={vault.address}
      active={currentEventKey === vault.address}
      showDevVaults={showDevVaults}
    />
  );

  let vaultRows = _.map(orderedVaults, renderVault);
  if (showDevVaults) {
    vaultRows = _.map(localContracts, renderVault);
  }

  return <React.Fragment>{vaultRows}</React.Fragment>;
};

Vaults.whyDidYouRender = true;
export default Vaults;
