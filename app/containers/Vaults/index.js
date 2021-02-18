import React, { useContext } from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import Accordion from 'react-bootstrap/Accordion';
import VaultsHeader from 'components/VaultsHeader';
import VaultsHeaderDev from 'components/VaultsHeaderDev';
import {
  selectAllContracts,
  selectContractsByTag,
  selectBackscratcherVault,
  selectOrderedVaults,
} from 'containers/App/selectors';
import { useSelector } from 'react-redux';
import Vault from 'components/Vault';
import { useShowDevVaults } from 'containers/Vaults/hooks';
// import VaultsNavLinks from 'components/VaultsNavLinks';
// import AddVault from 'components/AddVault';
import AccordionContext from 'react-bootstrap/AccordionContext';
import { useWallet, useAccount } from 'containers/ConnectionProvider/hooks';
import LinearProgress from '@material-ui/core/LinearProgress';
import BigNumber from 'bignumber.js';

const Wrapper = styled.div`
  margin: 0 auto;
  margin-top: 20px;
  @media (min-width: 768px) {
    width: 1088px;
  }
`;

const WrapTable = styled.div`
  ${tw`w-5/6 md:w-full m-0 m-auto md:overflow-x-auto overflow-x-scroll whitespace-nowrap`};
`;
const Warning = styled.div`
  display: table;
  font-size: 29px;
  margin: 0 auto;
  margin-top: 50px;
`;

// const DevHeader = styled.div`
//   opacity: ${(props) => (props.devMode ? 1 : 0)};
//   transition: opacity 100ms ease-in, margin-top 100ms ease-out;
//   margin-top: -50px;
//   pointer-events: none;
//   ${(props) =>
//     props.devMode &&
//     css`
//       margin-top: 30px;
//       color: black;
//       transition: opacity 100ms ease-in, margin-top 100ms ease-out;
//       pointer-events: inherit;
//     `}
// `;

const StyledAccordion = styled(Accordion)`
  width: 1085px;
  padding-bottom: 10px;
`;

const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = React.useState(config);

  const sortedItems = React.useMemo(() => {
    const sortableItems = Object.values(items);
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

const Vaults = () => {
  const showDevVaults = useShowDevVaults();
  const wallet = useWallet();
  const account = useAccount();
  const walletConnected = wallet.provider && account;
  const orderedVaults = useSelector(selectOrderedVaults);
  const localContracts = useSelector(selectContractsByTag('localContracts'));
  const backscratcherVault = useSelector(selectBackscratcherVault());
  const allContracts = useSelector(selectAllContracts());
  let vaultItems = showDevVaults ? localContracts : orderedVaults;

  const injectTokenBalanceOf = (vault) => {
    const newVault = vault;
    const { tokenAddress } = vault;
    const tokenContractData = allContracts[tokenAddress];
    const tokenBalanceOf = _.get(tokenContractData, 'balanceOf[0].value');
    newVault.tokenBalanceOf = tokenBalanceOf;
    return newVault;
  };

  vaultItems = _.map(vaultItems, (vault) => {
    let newVault;
    const vaultContractData = allContracts[vault.address];
    newVault = _.merge(vault, vaultContractData);
    newVault.balance = new BigNumber(vault.balance);
    newVault.apyRecommended = vault.apy.recommended;
    newVault = injectTokenBalanceOf(newVault);
    return newVault;
  });

  console.log(vaultItems);

  const { items, requestSort, sortConfig } = useSortableData(vaultItems);
  let columnHeader;
  let backscratcherWrapper;
  if (showDevVaults) {
    columnHeader = <VaultsHeaderDev />;
  } else {
    columnHeader = <VaultsHeader requestSort={requestSort} sortConfig={sortConfig} />;
  }

  let warning;
  if (showDevVaults) {
    warning = <Warning>Experimental vaults. Use at your own risk.</Warning>;
  } else if (backscratcherVault) {
    backscratcherWrapper = (
      <WrapTable>
        <VaultsHeader backscratcher />
        <StyledAccordion defaultActiveKey={backscratcherVault.address}>
          <BackscratchersWrapper
            showDevVaults={showDevVaults}
            walletConnected={walletConnected}
          />
        </StyledAccordion>
      </WrapTable>
    );
  }

  return (
    <Wrapper>
      {/* <DevHeader devMode={devMode}>
        <VaultsNavLinks />
        <AddVault devVaults={showDevVaults} />
      </DevHeader> */}
      {warning}
      {backscratcherWrapper}
      <WrapTable>
        {columnHeader}
        <StyledAccordion>
          <VaultsWrapper
            vaultItems={items}
            showDevVaults={showDevVaults}
            walletConnected={walletConnected}
          />
        </StyledAccordion>
      </WrapTable>
    </Wrapper>
  );
};

const BackscratchersWrapper = (props) => {
  const { showDevVaults, walletConnected } = props;
  const backscratcherVault = useSelector(selectBackscratcherVault());
  const currentEventKey = useContext(AccordionContext);
  const multiplier = _.get(backscratcherVault, 'apy.data.currentBoost');
  const multiplierText = `${multiplier.toFixed(2)}x`;
  backscratcherVault.multiplier = multiplierText;
  backscratcherVault.apy.recommended = backscratcherVault.apy.data.totalApy;
  const renderVault = (vault) => {
    const vaultKey = vault.address;
    return (
      <Vault
        vault={vault}
        key={vaultKey}
        accordionKey={vaultKey}
        active={currentEventKey === vaultKey}
        showDevVaults={showDevVaults}
        backscratcherVault
      />
    );
  };

  // Show Linear progress when orderedvaults is empty
  if (walletConnected && backscratcherVault == null) return <LinearProgress />;
  let vaultRows;
  if (!backscratcherVault) {
    vaultRows = [];
  } else {
    vaultRows = _.map([backscratcherVault], renderVault);
  }

  return <React.Fragment>{vaultRows}</React.Fragment>;
};

const VaultsWrapper = (props) => {
  const { showDevVaults, walletConnected, vaultItems } = props;
  const currentEventKey = useContext(AccordionContext);

  const renderVault = (vault) => {
    let vaultKey = vault.address;
    if (vault.pureEthereum) {
      vaultKey = `${vault.address}-eth`;
    }
    return (
      <Vault
        vault={vault}
        key={vaultKey}
        accordionKey={vaultKey}
        active={currentEventKey === vaultKey}
        showDevVaults={showDevVaults}
      />
    );
  };

  // Show Linear progress when orderedvaults is empty
  if (walletConnected && vaultItems == null) return <LinearProgress />;
  const vaultRows = _.map(vaultItems, renderVault);
  return <React.Fragment>{vaultRows}</React.Fragment>;
};

Vaults.whyDidYouRender = true;
export default Vaults;
