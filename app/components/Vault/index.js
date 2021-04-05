import React from 'react';
import { useSelector } from 'react-redux';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ColumnListAmplify from 'components/Vault/amplifyColumns';
import VaultButtons from 'components/VaultButtons';
import VaultControls from 'components/VaultControls';
import styled from 'styled-components';
import AnimatedNumber from 'components/AnimatedNumber';
import ButtonFilled from 'components/ButtonFilled';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import ColumnList from 'components/Vault/columns';
import ColumnListDev from 'components/Vault/columnsDev';
import BigNumber from 'bignumber.js';

import LazyApeLogo from 'images/lazy-ape-logo.svg';

import {
  selectContractData,
  selectEthBalance,
  selectTokenAllowance,
} from 'containers/App/selectors';
import { useContract } from 'containers/DrizzleProvider/hooks';
import {
  BACKSCRATCHER_ADDRESS,
  CRV_ADDRESS,
  MASTER_CHEF_ADDRESS,
  PICKLEJAR_ADDRESS,
  ZAP_YVE_CRV_ETH_PICKLE_ADDRESS,
  LAZY_APE_ADDRESSES,
} from 'containers/Vaults/constants';
import { selectMigrationData } from 'containers/Vaults/selectors';
import { selectZapperVaults } from 'containers/Zapper/selectors';
import { getContractType } from 'utils/contracts';
import TokenIcon from 'components/TokenIcon';
import Icon from 'components/Icon';
import { useModal } from 'containers/ModalProvider/hooks';
import Text from 'components/Text';
import Box from 'components/Box';

// import tw from 'twin.macro';

// const formatVaultStatistic = stat => {
//   switch (stat) {
//     // depositedAmount: "0"
//     //         depositedShares: "0"
//     //         earnings: "1534851627416"
//     //         totalDeposits: "285159143497674298"
//     //         totalTransferredIn: "0"
//     //         totalTransferredOut: "0"
//     //         totalWithdrawals: "285160678349301714"

//     case 'depositedAmount': {
//       return 'Available to withdraw';
//     }
//     case 'depositedShares': {
//       return 'Deposited Shares';
//     }
//     case 'totalDeposits': {
//       return 'Total Deposits';
//     }
//     case 'totalTransferredIn': {
//       return 'Total Transferred In';
//     }
//     case 'totalTransferredOut': {
//       return 'Total Transferred Out';
//     }
//     case 'totalWithdrawals': {
//       return 'Total Withdrawals';
//     }
//     case 'earnings': {
//       return 'Historical Earnings';
//     }
//     default: {
//       return '';
//     }
//   }
// };

// const statisticsToShow = [
//   'earnings',
//   'totalDeposits',
//   'totalWithdrawals',
//   'depositedAmount',
// ];

const ButtonLinkIcon = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  padding-top: 5px;

  img {
    margin-right: 10px;
  }
  span {
    text-decoration: none;
  }
`;

const IconAndName = styled.div`
  display: flex;
  align-items: center;
`;

const StyledTokenIcon = styled(TokenIcon)`
  width: 32px;
  margin-right: 16px;
`;

const StyledDoubleTokenIcon = styled.div`
  display: flex;
  align-items: center;
  position: relative;

  img:last-child {
    position: absolute;
    left: 10px;
    top: 0;
  }
`;

const IconName = styled.div`
  overflow: hidden;
  max-width: 145px;
  padding-right: 10px;
  text-overflow: ellipsis;
`;

const A = styled.a`
  display: inline-grid;
  text-decoration: underline;
`;

const Td = styled.td`
  &:not(:first-of-type) {
    padding-left: 20px;
  }
`;

const Table = styled.table`
  font-size: 20px;
  padding-left: 40px;
  padding-top: 40px;
  padding-bottom: 20px;
  border-collapse: initial;
  font-family: monospace;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ small }) => (small ? '8px 20px' : '24px 20px')} !important;
  width: 100%;
`;

const StatsIcon = styled(Icon)`
  height: 17px;
  position: relative;
  cursor: pointer;
  top: -3px;
  left: -22px;
`;

const Apy = styled.div`
  display: inline-block;
  width: 73px;
`;

const TooltipTable = styled.table`
  > tbody > tr > td {
    &:first-of-type {
      padding-right: 10px;
    }
  }
`;

const Notice = styled.div`
  padding: 15px !important;
  display: flex;
  justify-content: center;
  width: 100%;
`;

const Help = styled.span`
  cursor: help;
`;

const NoticeIcon = styled(Icon)`
  height: 1.2em;
  position: relative;
  cursor: pointer;
  margin: 0 0.8em;
`;

const StyledText = styled(Text)`
  cursor: pointer;
`;

const BigChar = styled.span`
  font-size: 20px;
  vertical-align: middle;
`;

const truncateFee = (fee) => {
  if (!fee) {
    return '0%';
  }
  const truncatedFee = (fee / 1e2).toFixed(2);
  const feeStr = `${truncatedFee}%`;
  return feeStr;
};

const truncateApy = (apy) => {
  if (!apy) {
    return 'N/A';
  }
  const truncatedApy = (apy * 100).toFixed(2);
  const apyStr = `${truncatedApy}%`;
  return apyStr;
};

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const truncateUsd = (value) => {
  if (!value) {
    return 'N/A';
  }
  if (value * 1e18 > 2 ** 255) {
    return '\u221e USD';
  }
  return usdFormatter.format(value);
};

const tokenFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const truncateToken = (value) => {
  if (!value) {
    return 'N/A';
  }
  if (value * 1e18 > 2 ** 255) {
    return '\u221e';
  }
  return tokenFormatter.format(value).slice(1);
};

const ApyErrorDescriptions = {
  'no harvests': {
    recommended: 'NEW ✨',
    tooltip:
      'This vault was just added or recently updated its strategy. APY data will be displayed after the first four harvests.',
  },
  'http error': {
    recommended: 'N/A',
    tooltip: 'Encoutered API error',
  },
};

const LinkWrap = (props) => {
  const { devMode, children, address, title } = props;
  if (!devMode) {
    return children || null;
  }
  return (
    <A
      href={`https://etherscan.io/address/${address}`}
      target="_blank"
      onClick={(evt) => evt.stopPropagation()}
      title={title}
    >
      {children}
    </A>
  );
};

const Vault = (props) => {
  const { vault, showDevVaults, active, accordionKey, amplifyVault } = props;
  const vaultContractData = useSelector(selectContractData(vault.address));
  _.merge(vault, vaultContractData);
  const {
    tokenAddress,
    tokenSymbolAlias,
    decimals,
    displayName,
    // totalAssets,
    // balance,
    balanceOf,
    address,
    name,
    getPricePerFullShare,
    pricePerShare,
    token,
    pureEthereum,
    CRV,
    // multiplier,
    depositLimit,
    alias,
    emergencyShutdown,
    // statistics,
  } = vault;

  const { openModal } = useModal();
  const isScreenMd = useMediaQuery('(min-width:960px)');

  const devMode = true;
  const tokenContractAddress = token.address || CRV;
  const ethBalance = useSelector(selectEthBalance());
  const crvContractData = useSelector(selectContractData(CRV_ADDRESS));
  const pickleJarContractData = useSelector(
    selectContractData(PICKLEJAR_ADDRESS),
  );
  const masterChefContractData = useSelector(
    selectContractData(MASTER_CHEF_ADDRESS),
  );
  const tokenContractData = useSelector(
    selectContractData(tokenContractAddress),
  );
  const zapYveCrvEthPickleConctract = useContract(
    ZAP_YVE_CRV_ETH_PICKLE_ADDRESS,
  );
  const crvTokenContract = useContract(CRV_ADDRESS);
  const pickleJarContract = useContract(PICKLEJAR_ADDRESS);
  const masterChefContract = useContract(MASTER_CHEF_ADDRESS);
  const crvTokenAllowance = useSelector(
    selectTokenAllowance(CRV_ADDRESS, ZAP_YVE_CRV_ETH_PICKLE_ADDRESS),
  );
  const pickleJarAllowance = useSelector(
    selectTokenAllowance(PICKLEJAR_ADDRESS, MASTER_CHEF_ADDRESS),
  );

  const veCrvAddress = '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2';
  const usdnVaultAddress = '0xFe39Ce91437C76178665D64d7a2694B0f6f17fE3';
  const daiV1VaultAddress = '0xACd43E627e64355f1861cEC6d3a6688B31a6F952';

  const veCrvContract = useSelector(selectContractData(veCrvAddress));

  const backscratcherTotalAssets = veCrvContract.balanceOf;

  const vaultIsBackscratcher = vault.address === BACKSCRATCHER_ADDRESS;
  const vaultIsPickle = vault.address === MASTER_CHEF_ADDRESS;

  const migrationData = useSelector(selectMigrationData);
  const vaultMigrationData = migrationData[address];
  const isMigratable = !!vaultMigrationData;

  const zapperVaults = useSelector(selectZapperVaults());
  const zapperVaultData = zapperVaults[address.toLowerCase()];
  const isZappable = !!zapperVaultData;

  let tokenBalance = _.get(tokenContractData, 'balanceOf');
  if (pureEthereum) {
    tokenBalance = ethBalance;
  }

  const parsedEthBalance = ethBalance
    ? new BigNumber(ethBalance).dividedBy(10 ** decimals).toFixed(2)
    : '0.00';

  const crvBalanceRaw = crvContractData && crvContractData.balanceOf;
  const parsedCrvBalance = crvBalanceRaw
    ? new BigNumber(crvContractData.balanceOf)
        .dividedBy(10 ** decimals)
        .toFixed(2)
    : '0.00';

  let pickleContractsData = null;

  if (vaultIsPickle) {
    const pickleJarBalanceRaw =
      pickleJarContractData && pickleJarContractData.balanceOf;
    const parsedPickleJarBalance = pickleJarBalanceRaw
      ? new BigNumber(pickleJarContractData.balanceOf)
          .dividedBy(10 ** decimals)
          .toFixed(2)
      : '0.00';

    const masterChefBalance = masterChefContractData
      ? new BigNumber(_.get(masterChefContractData, 'userInfo.amount'))
          .dividedBy(10 ** decimals)
          .toFixed(2)
      : '0.00';

    pickleContractsData = {
      zapPickleContract: zapYveCrvEthPickleConctract,
      pickleJarContract,
      masterChefContract,
      crvContract: crvTokenContract,
      pickleJarBalance: parsedPickleJarBalance,
      pickleJarBalanceRaw,
      pickleJarAllowance,
      pickleMasterChefDeposited: masterChefBalance,
      crvBalance: parsedCrvBalance,
      crvBalanceRaw,
      crvAllowance: crvTokenAllowance,
      ethBalance: parsedEthBalance,
      ethBalanceRaw: ethBalance,
    };
  }

  const tokenSymbol = tokenSymbolAlias || _.get(tokenContractData, 'symbol');
  // const tokenName = name || _.get(tokenContractData, 'name');

  let vaultName;
  if (vaultIsBackscratcher) {
    vaultName = 'CRV';
  } else if (vaultIsPickle) {
    vaultName = 'yveCRV - ETH';
  } else {
    vaultName = displayName || name || address;
  }

  const v2Vault = vault.type === 'v2' || vault.apiVersion;

  const { apy } = vault;

  const apyType = apy && apy.type;
  let apyRecommended =
    apyType !== 'error'
      ? truncateApy(_.get(apy, 'recommended'))
      : _.get(ApyErrorDescriptions, `[${apy.description}].recommended`);

  let grossApy = _.get(apy, 'data.grossApy');
  let netApy = _.get(apy, 'data.netApy');

  if (address === daiV1VaultAddress) {
    // Temporary one week sample APY for DAI v1 vault
    grossApy = apy.data.oneWeekSample;
    netApy = apy.data.oneWeekSample;
  }

  let apyTooltip = (
    <div>
      <TooltipTable>
        <tbody>
          <tr>
            <td>Gross APY</td>
            <td>{truncateApy(grossApy)}</td>
          </tr>
          <tr>
            <td>Net APY</td>
            <td>{truncateApy(netApy)}</td>
          </tr>
        </tbody>
      </TooltipTable>
    </div>
  );
  if (apyType === 'error') {
    apyTooltip = _.get(ApyErrorDescriptions, `[${apy.description}].tooltip`);
  } else if (vaultIsBackscratcher) {
    const currentBoost = _.get(apy, 'data.currentBoost', 0).toFixed(2);
    apyTooltip = (
      <div>
        Boosted yveCRV APY
        <br />
        <br />
        <TooltipTable>
          <tbody>
            <tr>
              <td>veCRV APY</td>
              <td>{truncateApy(apy.data.poolApy)}</td>
            </tr>
            <tr>
              <td>Boost</td>
              <td>{currentBoost}x</td>
            </tr>
            <tr>
              <td>Total APY</td>
              <td>{truncateApy(apy.data.totalApy)}</td>
            </tr>
          </tbody>
        </TooltipTable>
      </div>
    );
  } else if (apyType === 'curve') {
    const currentBoost = _.get(apy, 'data.currentBoost', 0).toFixed(2);
    apyTooltip = (
      <div>
        {apy.description}
        <br />
        <br />
        <TooltipTable>
          <tbody>
            <tr>
              <td>Pool APY</td>
              <td>{truncateApy(apy.data.poolApy)}</td>
            </tr>
            {apy.data.tokenRewardsApr > 0 && (
              <tr>
                <td>Bonus Rewards APR</td>
                <td>{truncateApy(apy.data.tokenRewardsApr)}</td>
              </tr>
            )}
            <tr>
              <td>Base CRV APR</td>
              <td>{truncateApy(apy.data.baseApr)}</td>
            </tr>
            <tr>
              <td>Boost</td>
              <td>{currentBoost}x</td>
            </tr>
            <tr>
              <td>Total APY</td>
              <td>{truncateApy(apy.data.totalApy)}</td>
            </tr>
            <tr>
              <td>Net APY</td>
              <td>{truncateApy(apy.data.netApy)}</td>
            </tr>
          </tbody>
        </TooltipTable>
      </div>
    );
  }

  let versionTooltip = null;
  if (vault.fees && vault.fees.general) {
    if (v2Vault) {
      const { managementFee, performanceFee } = vault.fees.general;
      const keepCrv =
        vault.fees && vault.fees.special.keepCrv > 0
          ? vault.fees.special.keepCrv
          : null;
      versionTooltip = (
        <div>
          <TooltipTable>
            <tbody>
              <tr>
                <td>Management Fee</td>
                <td>{truncateFee(managementFee)}</td>
              </tr>
              <tr>
                <td>Performance Fee</td>
                <td>{truncateFee(performanceFee)}</td>
              </tr>
              {keepCrv && (
                <tr>
                  <td>Locked CRV</td>
                  <td>{truncateFee(keepCrv)}</td>
                </tr>
              )}
            </tbody>
          </TooltipTable>
        </div>
      );
    } else {
      const { withdrawalFee, performanceFee } = vault.fees.general;
      const keepCrv =
        vault.fees && vault.fees.special.keepCrv > 0
          ? vault.fees.special.keepCrv
          : null;
      versionTooltip = (
        <div>
          <TooltipTable>
            <tbody>
              <tr>
                <td>Withdrawal Fee</td>
                <td>{truncateFee(withdrawalFee)}</td>
              </tr>
              <tr>
                <td>Performance Fee</td>
                <td>{truncateFee(performanceFee)}</td>
              </tr>
              {keepCrv && (
                <tr>
                  <td>Locked CRV</td>
                  <td>{truncateFee(keepCrv)}</td>
                </tr>
              )}
            </tbody>
          </TooltipTable>
        </div>
      );
    }
  }

  const tokenBalanceOf = tokenBalance
    ? new BigNumber(tokenBalance).dividedBy(10 ** decimals).toFixed()
    : '0.00';

  let vaultBalanceOf;
  if (v2Vault) {
    vaultBalanceOf = balanceOf
      ? new BigNumber(balanceOf)
          .dividedBy(10 ** decimals)
          .multipliedBy(pricePerShare / 10 ** decimals)
          .toFixed()
      : '0.00';
  } else if (vaultIsBackscratcher) {
    vaultBalanceOf = balanceOf
      ? new BigNumber(balanceOf).dividedBy(10 ** decimals).toFixed()
      : '0.00';
  } else {
    vaultBalanceOf = balanceOf
      ? new BigNumber(balanceOf)
          .dividedBy(10 ** decimals)
          .multipliedBy(getPricePerFullShare / 10 ** 18)
          .toFixed()
      : '0.00';
  }

  // let vaultAssets = vaultIsBackscratcher
  //   ? backscratcherTotalAssets
  //   : balance || totalAssets;
  // vaultAssets = new BigNumber(vaultAssets).dividedBy(10 ** decimals).toFixed(0);
  // vaultAssets = vaultAssets === 'NaN' ? '-' : abbreviateNumber(vaultAssets);

  let vaultAssets;
  let vaultAssetsTooltip;
  if (vaultIsBackscratcher) {
    vaultAssets = truncateUsd(
      new BigNumber(backscratcherTotalAssets)
        .dividedBy(10 ** decimals)
        .toNumber(),
    );
  } else if (vault.tvl) {
    vaultAssets = truncateUsd(vault.tvl.value);
    const totalAssets = new BigNumber(vault.tvl.totalAssets)
      .dividedBy(10 ** decimals)
      .toFixed(2);
    if (v2Vault && depositLimit) {
      const limit = new BigNumber(depositLimit)
        .dividedBy(10 ** decimals)
        .toFixed(2);
      const limitUsd = new BigNumber(depositLimit)
        .dividedBy(10 ** decimals)
        .times(vault.tvl.price)
        .toFixed(2);
      const shouldBeInfinite = new BigNumber(depositLimit).gte(2 ** 255);
      vaultAssetsTooltip = (
        <div>
          <TooltipTable>
            <tbody>
              <tr>
                <td>Total assets</td>
                <td>
                  {truncateToken(totalAssets)} {token.displayName}
                </td>
              </tr>
              {shouldBeInfinite ? (
                <tr>
                  <td>Deposit limit</td>
                  <td>
                    <BigChar>&#x221e;</BigChar> {token.displayName}
                  </td>
                </tr>
              ) : (
                <>
                  <tr>
                    <td>Deposit limit</td>
                    <td>
                      {truncateToken(limit)} {token.displayName}
                    </td>
                  </tr>
                  <tr>
                    <td />
                    <td>{truncateUsd(limitUsd)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </TooltipTable>
        </div>
      );
    } else {
      vaultAssetsTooltip = (
        <div>
          <TooltipTable>
            <tbody>
              <tr>
                <td>Total assets</td>
                <td>
                  {truncateToken(totalAssets)} {token.displayName}
                </td>
              </tr>
            </tbody>
          </TooltipTable>
        </div>
      );
    }
  } else {
    vaultAssets = truncateUsd(0);
  }

  if (address === '0xBA2E7Fed597fd0E3e70f5130BcDbbFE06bB94fe1') {
    // yfi vault
    apyRecommended = 'N/A';
    apyTooltip = 'Inactive with YIP-56: Buyback and Build';
  } else if (address === usdnVaultAddress) {
    // usdn vault
    apyRecommended = truncateApy(apy.data.netApy);
  } else if (address === daiV1VaultAddress) {
    // Temporary one week sample APY for DAI v1 vault
    apyRecommended = truncateApy(apy.data.oneWeekSample);
  }

  const contractType = getContractType(vault);

  let vaultBottom;
  let vaultTop;
  // eslint-disable-next-line no-unused-vars
  let vaultStats;
  let vaultControls;
  let vaultAdditionalInfo;

  const openContractStatisticsModal = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    openModal('contractStatistics', { vault });
  };

  let lazyApeButton;
  if (LAZY_APE_ADDRESSES.find((a) => a === vault.address)) {
    lazyApeButton = (
      <Box
        display="flex"
        flexDirection="column"
        width={1}
        mt={8}
        ml={isScreenMd ? '60px' : '0px'}
      >
        <span>
          Head to PowerPool and deposit {vault.tokenAlias} for additional yield
          in the Yearn Lazy Ape pool.
          <br />
          This pool allows you to earn swap fees on top of your yVault yield.
        </span>
        <Box mt={20} width="240px">
          <ButtonFilled color="primary">
            <ButtonLinkIcon
              className="wrapper"
              href="https://powerindex.io/#/mainnet/0x9ba60ba98413a60db4c651d4afe5c937bbd8044b/supply"
              target="_blank"
            >
              <img src={LazyApeLogo} alt="LazyApe" width="32" />
              <span>Join lazy ape</span>
            </ButtonLinkIcon>
          </ButtonFilled>
        </Box>
      </Box>
    );
  }

  if (showDevVaults) {
    const renderField = (val, key) => {
      let newVal = _.toString(val);
      const valIsAddress = /0[xX][0-9a-fA-F]{40}/.test(newVal);
      const valIsNumber = /^[0-9]*$/.test(newVal);
      if (valIsAddress) {
        newVal = (
          <A href={`https://etherscan.io/address/${newVal}`} target="_blank">
            {newVal}
          </A>
        );
      } else if (valIsNumber) {
        newVal = (
          <AnimatedNumber
            value={newVal}
            formatter={(v) => new BigNumber(v).toFixed(0)}
          />
        );
      }
      return (
        <tr key={key}>
          <Td>{key}</Td>
          <Td>{newVal}</Td>
        </tr>
      );
    };

    vaultControls = (
      <VaultButtons
        vault={vault}
        token={tokenContractData}
        showDevVaults={showDevVaults}
        vaultBalance={vaultBalanceOf}
        walletBalance={tokenBalanceOf}
        balanceOf={balanceOf}
        tokenBalance={tokenBalance}
      />
    );

    const strippedVault = _.omit(vault, ['group']);
    const fields = _.map(strippedVault, renderField);
    vaultBottom = (
      <Table>
        <tbody>{fields}</tbody>
      </Table>
    );

    vaultTop = (
      <ColumnListDev>
        <IconAndName>
          <LinkWrap devMode={devMode} address={address}>
            <StyledTokenIcon address={tokenContractAddress} icon={token.icon} />
          </LinkWrap>
          <LinkWrap devMode={devMode} address={address}>
            <div tw="flex">
              <IconName devMode={devMode}>{vaultName}</IconName>
            </div>
          </LinkWrap>
        </IconAndName>
        <div>{contractType}</div>
        <div>
          <AnimatedNumber value={vaultBalanceOf} />
        </div>
        <div>{vaultAssets}</div>
        <div>
          <AnimatedNumber value={tokenBalanceOf} />{' '}
          <LinkWrap devMode={devMode} address={tokenAddress}>
            {tokenSymbol}
          </LinkWrap>
        </div>
      </ColumnListDev>
    );
  } else {
    // const formattedUserVaultStatistics =
    //   statistics &&
    //   Object.keys(statistics)
    //     .filter(statistic => statisticsToShow.find(show => show === statistic))
    //     .map(statistic => {
    //       const formattedValue = new BigNumber(statistics[statistic])
    //         .dividedBy(10 ** decimals)
    //         .toFixed(8);

    //       return {
    //         name: formatVaultStatistic(statistic),
    //         value: formattedValue > 0 ? formattedValue : 0,
    //       };
    //     });

    // const formattedUserVaultStatisticsEarnings =
    //   statistics &&
    //   formattedUserVaultStatistics.map(earning => (
    //     <div key={earning.name}>
    //       <p tw="font-sans font-bold text-lg text-white">{earning.value}</p>
    //       <p tw="font-sans font-medium text-sm opacity-50">{earning.name}</p>
    //     </div>
    //   ));

    // const defaultZeroUserVaultStatisticsEarnings = statisticsToShow.map(
    //   statistic => (
    //     <div key={statistic}>
    //       <p tw="font-sans font-bold text-lg text-white">0</p>
    //       <p tw="font-sans font-medium text-sm opacity-50">
    //         {formatVaultStatistic(statistic)}
    //       </p>
    //     </div>
    //   ),
    // );
    // vaultBottom = (
    //   <ColumnList css={[tw`py-6`]}>
    //     <div>
    //       <p tw="font-sans font-bold text-xl text-white">Earnings: </p>
    //     </div>
    //     {statistics
    //       ? formattedUserVaultStatisticsEarnings
    //       : defaultZeroUserVaultStatisticsEarnings}
    //   </ColumnList>
    // );

    vaultControls = (
      <VaultControls
        vault={vault}
        token={tokenContractData}
        showDevVaults={showDevVaults}
        vaultBalance={vaultBalanceOf}
        walletBalance={tokenBalanceOf}
        balanceOf={balanceOf}
        tokenBalance={tokenBalance}
        pickleContractsData={pickleContractsData}
      />
    );
    const tokenIconAddress = vaultIsBackscratcher
      ? BACKSCRATCHER_ADDRESS
      : tokenContractAddress;

    if (amplifyVault) {
      let amplifyVaultTitle;
      let amplifyVaultDesc;
      let availableToDeposit = <AnimatedNumber value={tokenBalanceOf} />;
      let styledIcon = (
        <StyledTokenIcon address={tokenContractAddress} icon={token.icon} />
      );
      if (vaultIsBackscratcher) {
        amplifyVaultTitle = (
          <Text bold fontSize={5} mb={20}>
            Deposit your CRV to earn weekly 3Crv rewards
          </Text>
        );
        amplifyVaultDesc = (
          <Text>
            This vault converts your CRV into yveCRV at a 1:1 ratio, earning you
            a continuous share of Curve’s trading fees. Every week, these
            rewards can be claimed here as 3Crv (Curve’s 3pool LP token). These
            unclaimed rewards can also be staked directly into our 3Crv yVault
            using the Stake button on the left.
            <br />
            <br />
            This operation is non-reversible: you can only convert CRV into
            yveCRV, as any deposited CRV is perpetually staked in Curve’s voting
            escrow.
            <br />
            <br />
            If you prefer to earn higher returns on your CRV in an LP position,
            deposit into the yveCRV-ETH pJar.
          </Text>
        );
      }
      if (vaultIsPickle) {
        availableToDeposit = `${parsedEthBalance} ETH - ${parsedCrvBalance} CRV`;
        vaultBalanceOf = pickleContractsData.pickleMasterChefDeposited;
        apyTooltip = null;
        vaultAssetsTooltip = null;
        amplifyVaultTitle = (
          <Text bold fontSize={4} mb={40}>
            Zap CRV or ETH to earn compounding yield on a yveCRV-ETH LP position
          </Text>
        );
        amplifyVaultDesc = (
          <Text>
            This vault performs a multi-step transaction with your ETH or CRV
            which:
            <br />
            <br />
            1. Makes a deposit into yveCRV.
            <br />
            2. Stakes this yveCRV in the yveCRV-ETH SLP on SushiSwap for SUSHI
            🍣 rewards.
            <br />
            3. Deposits this SLP into the yveCRV-ETH pJar on Pickle Finance for
            PICKLE 🥒 rewards.
            <br />
            <br />
            Note: Remember to stake your Pickle LP manually after the
            transaction completes. If you’d like to claim earned PICKLE 🥒
            rewards or withdraw yveCRV-ETH SLP, please use the UI at{' '}
            <A href="https://app.pickle.finance/farms" target="_blank">
              https://app.pickle.finance/farms
            </A>
          </Text>
        );
        styledIcon = (
          <StyledDoubleTokenIcon>
            {/* NOTE CRV/ETH address for token icon */}
            <StyledTokenIcon address="0xc5bDdf9843308380375a611c18B50Fb9341f502A" />
            <StyledTokenIcon address="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" />
          </StyledDoubleTokenIcon>
        );
      }
      vaultTop = (
        <ColumnListAmplify gridTemplate={isScreenMd ? null : '190px'}>
          <IconAndName>
            <LinkWrap devMode={devMode} address={address} title={alias}>
              {styledIcon}
            </LinkWrap>
            <LinkWrap devMode={devMode} address={address} title={alias}>
              <div tw="flex items-center">
                <IconName devMode={devMode}>
                  <Text large bold>
                    {vaultName}
                  </Text>
                </IconName>
              </div>
            </LinkWrap>
          </IconAndName>
          <Hidden smDown>
            <Text large bold>
              {versionTooltip ? (
                <Tooltip title={versionTooltip} arrow>
                  <Help>{vaultIsPickle ? 'v1' : vault.type}</Help>
                </Tooltip>
              ) : (
                vault.type
              )}
            </Text>
            <Text large bold>
              <AnimatedNumber value={vaultBalanceOf} />
            </Text>
            {/* <Text large bold>
              {multiplier}
            </Text> */}
            <Text large bold>
              {apyTooltip ? (
                <Tooltip title={apyTooltip} arrow>
                  <Help>
                    <Apy>{apyRecommended}</Apy>
                  </Help>
                </Tooltip>
              ) : (
                apyRecommended
              )}
            </Text>
            <Text large bold>
              {vaultAssetsTooltip ? (
                <Tooltip title={vaultAssetsTooltip} arrow>
                  <Help>{vaultAssets}</Help>
                </Tooltip>
              ) : (
                vaultAssets
              )}
            </Text>
            <Text large bold>
              {availableToDeposit}
              <LinkWrap devMode={devMode} address={tokenAddress}>
                {tokenSymbol}
              </LinkWrap>
            </Text>
          </Hidden>
        </ColumnListAmplify>
      );

      vaultAdditionalInfo = (
        <Box my={50} mx={isScreenMd ? 50 : 20}>
          <Grid container spacing={isScreenMd ? 8 : 5}>
            <Grid className="amplify-vault-controls" item xs={12} md={6}>
              {amplifyVaultTitle}
              {vaultControls}
            </Grid>
            <Grid
              container
              item
              direction="row"
              alignItems="center"
              xs={12}
              md={6}
            >
              {amplifyVaultDesc}
            </Grid>
          </Grid>
        </Box>
      );
    } else {
      vaultTop = (
        <ColumnList gridTemplate={isScreenMd ? null : '210px'}>
          <IconAndName>
            <LinkWrap devMode={devMode} address={address} title={alias}>
              <StyledTokenIcon address={tokenIconAddress} icon={token.icon} />
            </LinkWrap>
            <LinkWrap devMode={devMode} address={address} title={alias}>
              <div tw="flex items-center">
                <IconName devMode={devMode}>
                  <Text large bold>
                    {vaultName}
                  </Text>
                </IconName>
              </div>
            </LinkWrap>
          </IconAndName>
          <Hidden smDown>
            <Text large bold>
              {versionTooltip ? (
                <Tooltip title={versionTooltip} arrow>
                  <Help>{vault.type}</Help>
                </Tooltip>
              ) : (
                vault.type
              )}
            </Text>
            <Text large bold>
              <AnimatedNumber value={vaultBalanceOf} />
            </Text>

            <Text large bold>
              {apyTooltip ? (
                <Tooltip title={apyTooltip} arrow>
                  <Help>
                    <Apy>{apyRecommended}</Apy>
                  </Help>
                </Tooltip>
              ) : (
                <Apy>{apyRecommended}</Apy>
              )}
            </Text>

            <Text large bold>
              {vaultAssetsTooltip ? (
                <Tooltip title={vaultAssetsTooltip} arrow>
                  <Help>{vaultAssets}</Help>
                </Tooltip>
              ) : (
                vaultAssets
              )}
            </Text>
            <Text large bold>
              <AnimatedNumber value={tokenBalanceOf} />{' '}
              <LinkWrap devMode={devMode} address={tokenAddress}>
                {tokenSymbol}
              </LinkWrap>
            </Text>
          </Hidden>
        </ColumnList>
      );
      vaultStats = (
        <StatsIcon type="stats" onClick={openContractStatisticsModal} />
      );
    }
  }
  return (
    <React.Fragment>
      <Card
        className={`vault ${amplifyVault ? 'amplify-vault' : ''} ${
          active ? 'active' : ''
        } ${vaultIsPickle ? 'pickle-vault' : ''}`}
        id={`vault-${accordionKey}`}
      >
        <Accordion.Toggle
          as={Card.Header}
          variant="link"
          eventKey={accordionKey}
        >
          {vaultTop}
          {/* {vaultStats} */}
          <StyledText fontWeight={700} mr={16}>
            {active ? 'HIDE' : 'SHOW'}
          </StyledText>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={accordionKey}>
          <Card.Body>
            {vaultBottom}
            {/* {['DAI', 'WETH', 'Ethereum'].includes(vaultName) && !v2Vault && (
                <Notice>
                  <NoticeIcon type="info" />
                  <span>Your tokens can be safely withdrawn, now</span>
                </Notice>
              )} */}
            {['crvUSDN'].includes(vaultName) && (
              <Notice>
                <NoticeIcon type="info" />
                <span>
                  50% of USDN CRV harvest is locked to boost yield. APY
                  displayed reflects this.
                </span>
              </Notice>
            )}
            {isMigratable && (
              <Box py={24} px={isScreenMd ? '76px' : '16px'}>
                <span>{vaultMigrationData.migrationMessage}</span>
              </Box>
            )}
            {isZappable && !isMigratable && (
              <Box py={24} px={isScreenMd ? '76px' : '16px'}>
                <span>
                  Deposit the underlying vault asset directly or zap in using
                  almost any token in your wallet. Please be aware that for
                  zaps, we use a default slippage limit of 1% and attempting
                  zaps with low-liquidity tokens may fail.
                </span>
              </Box>
            )}
            {emergencyShutdown && (
              <Notice>
                <NoticeIcon type="info" />
                <span>This vault has been disabled temporarily.</span>
              </Notice>
            )}
            {vaultAdditionalInfo}
            {!amplifyVault && (
              <Card.Footer className={active && 'active'}>
                <Footer small={!isScreenMd}>
                  {vaultControls}
                  {lazyApeButton}
                </Footer>
              </Card.Footer>
            )}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </React.Fragment>
  );
};
Vault.whyDidYouRender = false;
export default Vault;
