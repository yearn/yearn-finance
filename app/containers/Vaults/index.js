import React, { useContext, useEffect, useState } from 'react';
import {
  useWeb3,
  useWallet,
  useAccount,
} from 'containers/ConnectionProvider/hooks';
import styled from 'styled-components';
import { keyBy, get } from 'lodash';
import Hidden from '@material-ui/core/Hidden';
import Accordion from 'react-bootstrap/Accordion';
import VaultsHeader from 'components/VaultsHeader';
import VaultsHeaderDev from 'components/VaultsHeaderDev';
import {
  selectAllContracts,
  selectContractsByTag,
  selectEthBalance,
  selectBackscratcherVault,
  selectPickleVault,
  selectOrderedVaults,
  selectAmplifyVaults,
} from 'containers/App/selectors';
import PickleJarAbi2 from 'abi/pickleJar2.json';
import { useSelector } from 'react-redux';
import Vault from 'components/Vault';
import { useShowDevVaults } from 'containers/Vaults/hooks';
// import VaultsNavLinks from 'components/VaultsNavLinks';
// import AddVault from 'components/AddVault';
import AccordionContext from 'react-bootstrap/AccordionContext';
import LinearProgress from '@material-ui/core/LinearProgress';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import BigNumber from 'bignumber.js';
import Box from 'components/Box';
import request from 'utils/request';
import { ALIASES_API, YVBOOST_ETH_PJAR } from 'containers/Vaults/constants';
import setDecimals from 'utils/setDecimals';
import migrationWhitelist from 'containers/Vaults/migrationWhitelist.json';
import MigrationBannerSvg from './MigrationBannerSvg';

const Wrapper = styled(Box)`
  margin-top: 20px;
  overflow: auto;
`;

const WrapTable = styled(Box)`
  padding-bottom: 10px;

  div {
    padding-bottom: 0px;
  }
`;

const Warning = styled.div`
  display: table;
  font-size: 29px;
  margin: 0 auto;
  margin-top: 50px;
`;

const StyledAccordion = styled(Accordion)`
  padding-bottom: 10px;
  width: 100%;
`;

// TODO: Remove UI hacks...
const usdnVaultAddress = '0xFe39Ce91437C76178665D64d7a2694B0f6f17fE3';
const daiV1VaultAddress = '0xACd43E627e64355f1861cEC6d3a6688B31a6F952';

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
    let direction = 'descending';
    let newKey = key;
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'descending'
    ) {
      direction = 'ascending';
    } else if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      newKey = null;
      direction = null;
    }
    setSortConfig({ key: newKey, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

const Vaults = (props) => {
  const { history } = props;
  const [aliasByVault, setAliasByVault] = useState({});
  const isScreenMd = useMediaQuery('(min-width:960px)');
  const showDevVaults = useShowDevVaults();
  const wallet = useWallet();
  const account = useAccount();
  const walletConnected = wallet.provider && account;
  const orderedVaults = useSelector(selectOrderedVaults);
  const amplifyVaults = useSelector(selectAmplifyVaults());
  const localContracts = useSelector(selectContractsByTag('localContracts'));
  const allContracts = useSelector(selectAllContracts());
  const ethBalance = useSelector(selectEthBalance());

  const backscratcherVault = useSelector(selectBackscratcherVault());
  const pickleVault = useSelector(selectPickleVault());

  let vaultItems = showDevVaults ? localContracts : orderedVaults;

  function extractMigratedVaults(vaults) {
    const extractedVaults = [];
    const nonMigratedVaults = [];
    vaults.forEach((vault) => {
      let found = false;
      migrationWhitelist.forEach((migratedVault) => {
        if (migratedVault.vaultFrom === vault.address) {
          extractedVaults.push(vault);
          found = true;
        }
      });
      if (!found) {
        nonMigratedVaults.push(vault);
      }
    });
    return { extractedVaults, nonMigratedVaults };
  }
  function parseVaults(vaults) {
    return _.map(vaults, (vault) => {
      const vaultContractData = allContracts[vault.address] || {};
      const newVault = {
        ...vault,
        balanceOf: vaultContractData.balanceOf,
        getPricePerFullShare: vaultContractData.getPricePerFullShare,
        pricePerShare: vaultContractData.pricePerShare,
      };

      const { decimals } = vault;

      let { balanceOf, pricePerShare } = newVault;
      const { getPricePerFullShare } = newVault;

      balanceOf = _.get(balanceOf, '[0].value') || 0;
      pricePerShare = _.get(pricePerShare, '[0].value') || 1;
      // Account for backscratcher being non-standard
      const pricePerFullShare = _.get(getPricePerFullShare, '[0].value') || 1;

      // Value Deposited
      const v2Vault = vault.type === 'v2' || vault.apiVersion;
      let vaultBalanceOf;
      if (v2Vault) {
        vaultBalanceOf = balanceOf
          ? new BigNumber(balanceOf)
              .dividedBy(10 ** decimals)
              .multipliedBy(pricePerShare / 10 ** decimals)
              .toNumber()
          : 0;
      } else {
        vaultBalanceOf = balanceOf
          ? new BigNumber(balanceOf)
              .dividedBy(10 ** decimals)
              .multipliedBy(pricePerFullShare / 10 ** 18)
              .toNumber()
          : 0;
      }
      newVault.valueDeposited = vaultBalanceOf || 0;

      const isPickleJar = vault.tags
        ? !!vault.tags.find((tag) => tag === 'picklejar')
        : false;

      if (isPickleJar) {
        const { userInfo } = vaultContractData;
        balanceOf = _.get(userInfo, 'amount') || 0;

        newVault.balanceOf = balanceOf;
        newVault.valueDeposited = balanceOf;
      }

      // Growth
      newVault.valueApy = new BigNumber(_.get(newVault, 'apy.recommended', 0))
        .times(100)
        .toNumber();

      // USDN VAULT GROWTH
      if (vault.address === usdnVaultAddress) {
        newVault.valueApy = new BigNumber(_.get(newVault, 'apy.data.netApy', 0))
          .times(100)
          .toNumber();
      }

      if (vault.address === daiV1VaultAddress) {
        // Temporary one week sample APY for DAI v1 vault
        newVault.valueApy = new BigNumber(
          _.get(newVault, 'apy.data.oneWeekSample', 0),
        )
          .times(100)
          .toNumber();
      }

      // Total Assets
      newVault.valueTotalAssets = new BigNumber(
        _.get(newVault, 'tvl.value'),
      ).toNumber();

      // Available to Deposit
      const tokenContractAddress = vault.token.address || vault.CRV;
      const tokenContractData = allContracts[tokenContractAddress];
      const tokenBalance = vault.pureEthereum
        ? ethBalance
        : _.get(tokenContractData, 'balanceOf[0].value');
      const tokenBalanceOf = tokenBalance
        ? new BigNumber(tokenBalance).dividedBy(10 ** decimals).toNumber()
        : 0;
      newVault.valueAvailableToDeposit = tokenBalanceOf || 0;

      newVault.alias = get(aliasByVault[vault.address], 'name') || vault.name;
      newVault.tokenAlias =
        get(aliasByVault[vault.address], 'symbol') || vault.displayName;
      return Object(newVault);
    });
  }

  vaultItems = parseVaults(vaultItems);
  const amplifyVaultItems = parseVaults(amplifyVaults);
  const migratedVaultsResults = extractMigratedVaults(vaultItems);
  vaultItems = migratedVaultsResults.nonMigratedVaults;
  const migratedVaultItems = migratedVaultsResults.extractedVaults;
  const { items, requestSort, sortConfig } = useSortableData(vaultItems);
  const migratedSortedData = useSortableData(migratedVaultItems);
  const migratedItems = migratedSortedData.items;

  useEffect(() => {
    requestSort('valueDeposited');
    request(ALIASES_API).then((response) => {
      setAliasByVault(keyBy(response, 'address'));
    });
  }, []);

  const backscratcherAlias = backscratcherVault
    ? get(aliasByVault[backscratcherVault.address], 'name') ||
      backscratcherVault.name
    : 'Backscratcher';
  const pickleVaultAlias = pickleVault
    ? get(aliasByVault[pickleVault.address], 'name') || pickleVault.name
    : 'Pickle';

  // Show the vault based on URL path
  const pathArray = history.location.pathname.split('/');
  const showAccordionKey = pathArray[2] || '';

  useEffect(() => {
    // Scroll to the vault
    if (showAccordionKey && orderedVaults) {
      const anchor = `vault-${showAccordionKey}`;
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [orderedVaults]);

  let columnHeader;
  let amplifyVaultsWrapper;
  if (showDevVaults) {
    columnHeader = <VaultsHeaderDev />;
  } else {
    columnHeader = (
      <VaultsHeader requestSort={requestSort} sortConfig={sortConfig} />
    );
  }
  const [yvBOOSTBalance, setYvBOOSTBalance] = useState(0);
  const web3 = useWeb3();

  useEffect(() => {
    const getBalance = async () => {
      try {
        const yvBoostETHContract = new web3.eth.Contract(
          PickleJarAbi2,
          YVBOOST_ETH_PJAR,
        );
        const r = await yvBoostETHContract.methods.balanceOf(account).call();
        setYvBOOSTBalance(r);
      } catch (error) {
        console.log(error);
      }
    };
    getBalance();
  }, []);
  let yboostLPVault = {};
  amplifyVaultItems.map((v) => {
    if (v.symbol === 'yvBOOST') {
      yboostLPVault = v;
      yboostLPVault = {
        ...yboostLPVault,
        ...{
          type: 'v2',
          displayName: 'yvBOOST - ETH',
          isYVBoost: true,
          symbol: 'yvBOOST-ETH',
          address: '0xc695f73c1862e050059367B2E64489E66c525983',
        },
      };
    }
    return v;
  });
  const tmpVault = amplifyVaultItems[1];
  // eslint-disable-next-line prefer-destructuring
  amplifyVaultItems[1] = amplifyVaultItems[2];
  amplifyVaultItems[2] = tmpVault;
  amplifyVaultItems.push(yboostLPVault);
  let warning;
  if (showDevVaults) {
    warning = <Warning>Experimental vaults. Use at your own risk.</Warning>;
  } else if (backscratcherVault) {
    amplifyVaultsWrapper = (
      <WrapTable center width={1} className="amplify-vaults">
        <Hidden smDown>{<VaultsHeader amplifyVault />}</Hidden>
        <StyledAccordion>
          <AmplifyWrapper
            showDevVaults={showDevVaults}
            walletConnected={walletConnected}
            account={account}
            vaultItems={amplifyVaultItems}
            backscratcherAlias={backscratcherAlias}
            pickleVaultAlias={pickleVaultAlias}
            yvBOOSTBalance={yvBOOSTBalance}
          />
        </StyledAccordion>
      </WrapTable>
    );
    // NOTE The backscratcher is removed in reducer now
    // remove backscratcher from items
    // items.splice(
    //   items.findIndex(({ address }) => address === backscratcherVault.address),
    //   1,
    // );
  }

  const linkToVault = (accordionKey) => {
    const path = accordionKey || '';
    history.push(`/vaults/${path}`);
  };

  return (
    <Wrapper center mx={isScreenMd ? 0 : [16, 32]}>
      <Box
        width={isScreenMd ? '90%' : '100%'}
        minWidth={isScreenMd ? 1030 : null}
        maxWidth={1200}
        center
      >
        {/* <DevHeader devMode={devMode}>
        <VaultsNavLinks />
        <AddVault devVaults={showDevVaults} />
      </DevHeader> */}
        {warning}
        {amplifyVaultsWrapper}
        <WrapTable center width={1}>
          <StyledAccordion
            onSelect={linkToVault}
            defaultActiveKey={showAccordionKey}
          >
            <VaultsWrapper
              vaultItems={migratedItems}
              showDevVaults={showDevVaults}
              walletConnected={walletConnected}
              account={account}
              isMigrated
            />
          </StyledAccordion>
        </WrapTable>
        <WrapTable center width={1}>
          <Hidden smDown>{columnHeader}</Hidden>
          <StyledAccordion
            onSelect={linkToVault}
            defaultActiveKey={showAccordionKey}
          >
            <VaultsWrapper
              vaultItems={items}
              showDevVaults={showDevVaults}
              account={account}
              walletConnected={walletConnected}
            />
          </StyledAccordion>
        </WrapTable>
      </Box>
    </Wrapper>
  );
};

const AmplifyWrapper = (props) => {
  const {
    showDevVaults,
    walletConnected,
    vaultItems,
    backscratcherAlias,
    pickleVaultAlias,
    account,
    yvBOOSTBalance,
  } = props;
  const backscratcherVault = useSelector(selectBackscratcherVault());
  const pickleVault = useSelector(selectPickleVault());
  const web3 = useWeb3();

  const currentEventKey = useContext(AccordionContext);
  const multiplier = _.get(backscratcherVault, 'apy.data.currentBoost', 0);
  const multiplierText = `${multiplier.toFixed(2)}x`;
  // TODO Check to remove this
  backscratcherVault.multiplier = multiplierText;
  backscratcherVault.apy.recommended = backscratcherVault.apy.data.boostedApr;
  backscratcherVault.alias = backscratcherAlias;

  pickleVault.alias = pickleVaultAlias;

  const renderVault = (vault) => {
    if (vault.displayName === 'SLP') {
      // eslint-disable-next-line no-param-reassign
      vault.displayName = 'yveCRV - ETH';
    }
    const vaultKey = vault.address;
    return (
      <Vault
        vault={vault}
        key={vaultKey}
        accordionKey={vaultKey}
        active={currentEventKey === vaultKey}
        showDevVaults={showDevVaults}
        amplifyVault
        walletConnected={walletConnected}
        account={account}
        web3={web3}
        yvBOOSTBalance={yvBOOSTBalance}
      />
    );
  };

  // Show Linear progress when orderedvaults is empty
  if (walletConnected && vaultItems == null) return <LinearProgress />;
  let vaultRows;
  if (!vaultItems.length) {
    vaultRows = [];
  } else {
    vaultRows = _.map(vaultItems, renderVault);
  }

  return <React.Fragment>{vaultRows}</React.Fragment>;
};

const VaultsWrapper = (props) => {
  const {
    showDevVaults,
    walletConnected,
    vaultItems,
    isMigrated,
    account,
  } = props;
  const currentEventKey = useContext(AccordionContext);
  const web3 = useWeb3();
  let hasBeenShown = false;
  const migratedVaultsWithBalance = [];
  if (isMigrated) {
    vaultItems.forEach((vault) => {
      let decimals = 18;
      if (vault && vault.token && vault.token.decimals > 0) {
        decimals = setDecimals(vault.token.decimals);
      }
      if (
        vault &&
        vault.balanceOf &&
        vault.balanceOf[0].value >= 10 ** decimals
      ) {
        migratedVaultsWithBalance.push(vault);
      }
    });
  }
  const renderVault = (vault) => {
    let vaultKey = vault.address;
    if (vault.pureEthereum) {
      vaultKey = `${vault.address}-eth`;
    }
    let banner = null;
    let decimals = 18;
    if (vault && vault.token && vault.token.decimals > 0) {
      decimals = setDecimals(vault.token.decimals);
    }

    if (
      vault &&
      vault.balanceOf &&
      vault.balanceOf[0].value >= 10 ** decimals &&
      isMigrated &&
      !hasBeenShown
    ) {
      banner = <MigrationBannerSvg vaults={migratedVaultsWithBalance} />;
      hasBeenShown = true;
    }
    return (
      <>
        {banner}
        <Vault
          vault={vault}
          key={vaultKey}
          accordionKey={vaultKey}
          active={currentEventKey === vaultKey}
          showDevVaults={showDevVaults}
          account={account}
          web3={web3}
        />
      </>
    );
  };

  // Show Linear progress when orderedvaults is empty
  if (walletConnected && vaultItems == null) return <LinearProgress />;
  const vaultRows = _.map(vaultItems, renderVault);
  return <React.Fragment>{vaultRows}</React.Fragment>;
};

Vaults.whyDidYouRender = true;
export default Vaults;
