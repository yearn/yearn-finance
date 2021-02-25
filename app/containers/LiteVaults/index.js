import React from 'react';
import styled from 'styled-components';
import Accordion from 'react-bootstrap/Accordion';
import TokenIcon from 'components/TokenIcon';
import BigNumber from 'bignumber.js';
// import VaultsHeaderDev from 'components/VaultsHeaderDev';
import { selectVaults, selectContracts } from 'containers/App/selectors';
// import { selectDevMode } from 'containers/DevMode/selectors';
import { useSelector } from 'react-redux';
import { useShowDevVaults } from 'containers/Vaults/hooks';
import Table from 'components/Table';
import IconButton from 'components/IconButton';
import InfoCard from 'components/InfoCard';
import { currencyTransform } from 'utils/string';

const Cards = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3,1fr);
  grid-column-gap: 16px;
  margin-bottom: 32px;
}
`;

const Buttons = styled.div`
  display: inline-flex;
  grid-gap: 12px;
`;

const Wrapper = styled.div`
  width: 1088px;
  margin: 0 auto;
`;

const StyledTokenIcon = styled(TokenIcon)`
  width: 30px;
  margin-right: 20px;
`;

const IconName = styled.div`
  overflow: hidden;
  padding-right: 10px;
  text-overflow: ellipsis;
`;

const IconAndName = styled.div`
  display: flex;
  align-items: center;
`;

const Vaults = () => {
  // const devMode = useSelector(selectDevMode());
  const showDevVaults = useShowDevVaults();

  let columnHeader;
  // if (false) {
  //   columnHeader = <VaultsHeaderDev />;
  // }

  return (
    <Wrapper>
      {columnHeader}
      <Accordion>
        <VaultsWrapper showDevVaults={showDevVaults} />
      </Accordion>
    </Wrapper>
  );
};

const tokenTransform = (val, asset) => {
  const { vaultAlias, tokenAddress, address, token } = asset;
  const tokenContractAddress = tokenAddress || token;
  return (
    <IconAndName>
      <StyledTokenIcon address={tokenContractAddress} />
      <IconName>{vaultAlias || address}</IconName>
    </IconAndName>
  );
};

const apyTransform = (apyObj) => {
  const apyTruncated = parseFloat(apyObj.apyOneMonthSample).toFixed(2);
  let displayApy = 'N/A';
  if (apyTruncated !== 'NaN') {
    displayApy = `${apyTruncated}%`;
  }
  return displayApy;
};

const vaultActionsTransform = (val, row) => {
  let withdrawButton;
  if (row.depositedNormalized > 0) {
    withdrawButton = <IconButton iconType="arrowUpAlt">Withdraw</IconButton>;
  }
  return (
    <Buttons>
      {withdrawButton}
      <IconButton iconType="arrowDownAlt">Deposit</IconButton>
      <IconButton iconType="stats">Stats</IconButton>
    </Buttons>
  );
};

const earnedTransform = (statistics, vault) => {
  const { earnings = 0 } = statistics;
  const earningsNormalized = new BigNumber(earnings)
    .dividedBy(10 ** vault.decimals)
    .toFixed(2);
  return currencyTransform(earningsNormalized);
};

const tokenBalanceTransform = (tokenBalanceOf, vault) => {
  const tokenBalanceOfNormalized = new BigNumber(tokenBalanceOf)
    .dividedBy(10 ** vault.decimals)
    .toFixed(4);
  const displayBalance =
    tokenBalanceOfNormalized === 'NaN' ? '-' : tokenBalanceOfNormalized;

  return displayBalance;
};

const depositedTransform = (depositedNormalized) => {
  const displayDeposited =
    depositedNormalized === 'NaN' ? '-' : depositedNormalized;
  return displayDeposited;
};

const VaultsWrapper = () => {
  const vaults = useSelector(selectVaults('vaults'));
  const vaultsContractData = useSelector(selectContracts('vaults'));
  const tokensContractData = useSelector(selectContracts('tokens'));

  const mergeVaultsData = (vault) => {
    const apiVaultAddress = vault.address;
    const vaultContractData =
      _.find(
        vaultsContractData,
        (vaultContract) => vaultContract.address === apiVaultAddress,
      ) || {};

    const mergedVault = _.merge(vault, vaultContractData);

    const tokenContractData =
      _.find(
        tokensContractData,
        (tokenContract) => tokenContract.address === vault.token.address,
      ) || {};

    const tokenBalanceOf = _.get(tokenContractData, 'balanceOf[0].value');
    const deposited = _.get(vaultContractData, 'balanceOf[0].value');
    const depositedNormalized = new BigNumber(deposited)
      .dividedBy(10 ** vault.decimals)
      .toFixed(4);

    mergedVault.tokenBalanceOf = tokenBalanceOf;
    mergedVault.depositedNormalized = depositedNormalized;
    return mergedVault;
  };
  const mergedVaultsData = _.orderBy(
    _.map(vaults, mergeVaultsData),
    'depositedNormalized',
    'desc',
  );

  const filterYourVaults = (vault) => _.get(vault, 'balanceOf[0].value') > 0;
  const filterNotYourVaults = (vault) =>
    _.get(vault, 'balanceOf[0].value') === '0';

  const yourVaults = _.filter(mergedVaultsData, filterYourVaults);
  const otherVaults = _.filter(mergedVaultsData, filterNotYourVaults);
  const otherVaultsSorted = _.orderBy(otherVaults, 'tokenBalanceOf', 'desc');

  const yourVaultsTable = {
    title: 'Your vaults',
    columns: [
      {
        key: 'tokenIconAndName',
        alias: 'Asset',
        transform: tokenTransform,
      },
      { key: 'apy', alias: 'ROI', transform: apyTransform },
      { key: 'statistics', alias: 'earned', transform: earnedTransform },
      {
        key: 'tokenBalanceOf',
        alias: 'Balance',
        transform: tokenBalanceTransform,
      },
      {
        key: 'depositedNormalized',
        alias: 'deposited',
        transform: depositedTransform,
      },
      { key: 'actions', alias: '', transform: vaultActionsTransform },
    ],
    rows: yourVaults,
  };

  const allVaultsTable = {
    title: 'All vaults',
    columns: [
      {
        key: 'tokenIconAndName',
        alias: 'Asset',
        transform: tokenTransform,
      },
      { key: 'apy', alias: 'ROI', transform: apyTransform },
      { key: 'statistics', alias: 'earned', transform: earnedTransform },
      {
        key: 'tokenBalanceOf',
        alias: 'Balance',
        transform: tokenBalanceTransform,
      },
      {
        key: 'depositedNormalized',
        alias: 'deposited',
        transform: depositedTransform,
      },
      { key: 'actions', alias: '', transform: vaultActionsTransform },
    ],
    rows: otherVaultsSorted,
  };

  return (
    <React.Fragment>
      <Cards>
        <InfoCard label="Unique Users" value="3344234" />
        <InfoCard
          label="Your Earnings"
          value="1233"
          formatter={currencyTransform}
        />
        <InfoCard
          label="TVL"
          value="493342132.53193647"
          formatter={currencyTransform}
        />
      </Cards>
      <Table data={yourVaultsTable} />
      <Table data={allVaultsTable} />
    </React.Fragment>
  );
};

Vaults.whyDidYouRender = true;
export default Vaults;
