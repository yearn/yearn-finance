import React from 'react';
import { useSelector } from 'react-redux';
import { keyBy } from 'lodash';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import ColumnListAmplify from 'components/Vault/amplifyColumns';
import VaultButtons from 'components/VaultButtons';
import VaultControls from 'components/VaultControls';
import ButtonFilled from 'components/ButtonFilled';
import AnimatedNumber from 'components/AnimatedNumber';
import ColumnList from 'components/Vault/columns';
import ColumnListDev from 'components/Vault/columnsDev';
import TokenIcon from 'components/TokenIcon';
import Icon from 'components/Icon';
import Text from 'components/Text';
import Box from 'components/Box';

import LazyApeLogo from 'images/lazy-ape-logo.svg';

import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import migrationWhitelist from 'containers/Vaults/migrationWhitelist.json';
import futureMigrationWhitelist from 'containers/Vaults/futureMigrationWhitelist.json';
import retiredJson from 'containers/Vaults/retiredWhitelist.json';
import hackedOrToBeAbsolutelyRemovedJson from 'containers/Vaults/hackedEmergencyWhitelist.json';
import PickleGaugeAbi from 'abi/pickleGauge.json';
import OldPickleGaugeAbi from 'abi/oldPickleGauge.json';

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
  YVBOOST_ADDRESS,
  PICKLE_GAUGE_ADDRESS,
  OLD_PICKLE_GAUGE_ADDRESS,
  LAZY_APE_ADDRESSES,
} from 'containers/Vaults/constants';
import { selectMigrationData } from 'containers/Vaults/selectors';
import { selectZapperVaults } from 'containers/Zapper/selectors';
import { getContractType } from 'utils/contracts';
import setDecimals from 'utils/setDecimals';

import { useModal } from 'containers/ModalProvider/hooks';

const ButtonLinkIcon = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
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
  text-decoration: none;
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
    return 'NEW ✨';
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
  if (!value && value !== 0) {
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
  const {
    vault,
    showDevVaults,
    active,
    accordionKey,
    amplifyVault,
    account,
    walletConnected,
    web3,
    yvBOOSTBalance,
  } = props;
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

  const veCrvContract = useSelector(selectContractData(veCrvAddress));

  const backscratcherTotalAssets = veCrvContract.balanceOf;

  const vaultIsBackscratcher = vault.address === BACKSCRATCHER_ADDRESS;
  const vaultIsPickle = vault.address === MASTER_CHEF_ADDRESS;
  const vaultIsYvBoost = vault.address === YVBOOST_ADDRESS;

  const migrationData = useSelector(selectMigrationData);
  const vaultMigrationData = migrationData[address];
  const isMigratable = !!vaultMigrationData;

  const zapperVaults = useSelector(selectZapperVaults());
  const zapperVaultData = zapperVaults[address.toLowerCase()];
  const isZappable = !!zapperVaultData;

  const [userInfoYvBoostEth, setUserInfoYvBoostEth] = React.useState(0);
  const [oldPickleGaugeBalance, setOldPickleGaugeBalance] = React.useState(0);
  const [apyPickleRecommended, setApyPickleRecommended] = React.useState(
    'NEW ✨',
  );
  const [vaultAssetsPickle, setVaultAssetsPickle] = React.useState(
    truncateUsd(0),
  );

  React.useEffect(() => {
    const getOldGaugeBalance = async () => {
      if (!vault.isYVBoost && vaultIsPickle && account) {
        const oldPickleGaugeContract = new web3.eth.Contract(
          OldPickleGaugeAbi,
          OLD_PICKLE_GAUGE_ADDRESS,
        );
        try {
          const r = await oldPickleGaugeContract.methods
            .balanceOf(account)
            .call();
          setOldPickleGaugeBalance(r);
        } catch (error) {
          console.log(error);
        }
      }
    };
    getOldGaugeBalance();
  }, [oldPickleGaugeBalance]);

  React.useEffect(() => {
    const getUserInfo = async () => {
      if (vault.isYVBoost && account) {
        const pickleGaugeContract = new web3.eth.Contract(
          PickleGaugeAbi,
          PICKLE_GAUGE_ADDRESS,
        );
        try {
          const r = await pickleGaugeContract.methods.balanceOf(account).call();
          setUserInfoYvBoostEth(r);
        } catch (error) {
          console.log(error);
        }
      }
    };
    getUserInfo();
  }, [userInfoYvBoostEth]);

  React.useEffect(() => {
    const getPickleAPY = async () => {
      if (vault.isYVBoost || vaultIsPickle) {
        try {
          const jarId = vault.isYVBoost ? 'yvboost-eth' : 'yvecrv-eth';
          const resp = await fetch(
            `https://stkpowy01i.execute-api.us-west-1.amazonaws.com/prod/protocol/jar/${jarId}/performance`,
          );
          const apy = await resp.json();
          if (apy && apy.sevenDayFarm) {
            const amount = `${apy.sevenDayFarm.toFixed(2)}%`;
            setApyPickleRecommended(amount);
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    getPickleAPY();
  }, [apyPickleRecommended]);

  React.useEffect(() => {
    const getPickleAssets = async () => {
      if (vault.isYVBoost || vaultIsPickle) {
        try {
          const jarId = vault.isYVBoost ? 'yvboost-eth' : 'yvecrv-eth';
          const resp = await fetch(
            'https://stkpowy01i.execute-api.us-west-1.amazonaws.com/prod/protocol/pools',
          );
          const pools = await resp.json();
          const asset = keyBy(pools, 'identifier');
          if (asset && asset[jarId]) {
            const assetRounded = parseInt(asset[jarId].liquidity_locked, 10);
            setVaultAssetsPickle(truncateUsd(assetRounded));
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    getPickleAssets();
  }, [vaultAssetsPickle]);

  let tokenBalance = _.get(tokenContractData, 'balanceOf');
  if (pureEthereum) {
    tokenBalance = ethBalance;
  }
  const vaultBalanceDecimalPlacesCount = 4;

  const vaultBalanceFormatter = (v) =>
    v.toLocaleString('en', {
      minimumFractionDigits: vaultBalanceDecimalPlacesCount,
      maximumFractionDigits: vaultBalanceDecimalPlacesCount,
    });

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

  if (vaultIsPickle || vault.isYVBoost) {
    const pickleJarBalanceRaw =
      pickleJarContractData && pickleJarContractData.balanceOf;
    const parsedPickleJarBalance = pickleJarBalanceRaw
      ? new BigNumber(pickleJarContractData.balanceOf)
          .dividedBy(10 ** decimals)
          .toFixed(2)
      : '0.00';

    const masterChefBalanceRaw = masterChefContractData
      ? _.get(masterChefContractData, 'userInfo.amount')
      : '0.00';
    const masterChefBalance = masterChefContractData
      ? new BigNumber(masterChefBalanceRaw).dividedBy(10 ** decimals).toFixed(2)
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
      pickleMasterChefDepositedRaw: masterChefBalanceRaw,
      crvBalance: parsedCrvBalance,
      crvBalanceRaw,
      decimals,
      crvAllowance: crvTokenAllowance,
      ethBalance: parsedEthBalance,
      ethBalanceRaw: ethBalance,
    };
  }

  const tokenSymbol = tokenSymbolAlias || _.get(tokenContractData, 'symbol');
  // const tokenName = name || _.get(tokenContractData, 'name');

  let vaultName;
  if (vaultIsPickle && !vault.vaultIsYvBoost) {
    vaultName = 'yveCRV - ETH';
  }
  if (vault.isYVBoost) {
    vaultName = 'yvBOOST - ETH';
  } else {
    vaultName = displayName || name || address;
  }

  const v2Vault = vault.type === 'v2' || vault.apiVersion;

  const { apy } = vault;

  const apyType = apy && apy.type;
  const apyError = apy && apy.error;
  let apyRecommended = !apyError
    ? truncateApy(_.get(apy, 'recommended'))
    : _.get(ApyErrorDescriptions, `[${apyError.description}].recommended`);

  const grossApy = _.get(apy, 'data.grossApy');
  const netApy = _.get(apy, 'data.netApy');

  let apyTooltip = (
    <div>
      <TooltipTable>
        <tbody>
          <tr>
            <td>Gross APR</td>
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
  if (apyError) {
    apyTooltip = _.get(
      ApyErrorDescriptions,
      `[${apyError.description}].tooltip`,
    );
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
              <td>Gross APR</td>
              <td>{truncateApy(apy.data.boostedApr)}</td>
            </tr>
          </tbody>
        </TooltipTable>
      </div>
    );
  } else if (apyType === 'crv') {
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
              <td>Gross APR</td>
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

  if (userInfoYvBoostEth) {
    vaultBalanceOf = userInfoYvBoostEth
      ? new BigNumber(userInfoYvBoostEth).dividedBy(10 ** decimals).toFixed()
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

  // These are our retired vaults, shutting down but not migrating.
  const retired = retiredJson.map((v) => v.address);

  // These are emergency vaults that needs to be hidden immediatly
  // because of bug or hack regardless of balance
  const hackedOrToBeAbsolutelyRemoved = hackedOrToBeAbsolutelyRemovedJson.map(
    (v) => v.address,
  );

  // Vaults that we're migrating to a new version.
  const migrating = migrationWhitelist.map((v) => v.vaultFrom);
  const futureMigrating = futureMigrationWhitelist.map((v) => v.vaultFrom);
  const migratingTooltips = {};
  const retiredTooltips = {};
  migrationWhitelist.forEach((v) => {
    migratingTooltips[v.vaultFrom] = v.apyTooltip;
  });
  retiredJson.forEach((v) => {
    retiredTooltips[v.vaultFrom] = v.apyTooltip;
  });
  // Add all vaults here that we only want current holders to see. Include migrating and retiring vaults.
  const vaultsToHide = migrating.concat(retired).concat(futureMigrating);

  if (migrating.includes(address)) {
    apyRecommended = 'N/A';
    apyTooltip = migratingTooltips[address];
  } else if (vaultIsPickle) {
    apyRecommended = 'N/A';
    apyTooltip =
      'Please migrate funds to yvBOOST-ETH to continue earning maximum yield.';
  } else if (retired.includes(address)) {
    apyRecommended = 'N/A';
    apyTooltip = retiredTooltips[address];
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
          Head to PowerPool and deposit {vault.symbol} for additional yield in
          the Yearn Lazy Ape pool.
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
        balanceDecimalPlacesCount={vaultBalanceDecimalPlacesCount}
        account={account}
        walletConnected={walletConnected}
        oldPickleGaugeBalance={oldPickleGaugeBalance}
        yvBOOSTBalance={yvBOOSTBalance}
      />
    );
    const tokenIconAddress = vaultIsBackscratcher
      ? BACKSCRATCHER_ADDRESS
      : tokenContractAddress;

    if (amplifyVault) {
      let amplifyVaultTitle;
      let amplifyVaultDesc;
      let availableToDeposit = <AnimatedNumber value={tokenBalanceOf} />;
      if (vault.isYVBoost) {
        availableToDeposit = `${parsedEthBalance} ETH - ${parsedCrvBalance} CRV`;
      }
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
            <b>Note:</b> yveCRV was replaced with more powerful yvBOOST vault.
            Consider yvBOOST instead of using &quot;Restake&quot; button every
            week.
            <br />
            <br />
            This vault converts your CRV into yveCRV, earning you a continuous
            share of Curve’s trading fees. Every week, these rewards can be
            claimed here as 3Crv (Curve’s 3pool LP token). These rewards can
            also be restaked into more yveCRV with one click.
            <br />
            <br />
            This operation is non-reversible: you can only convert CRV into
            yveCRV, as any deposited CRV is perpetually staked in Curve’s voting
            escrow.
          </Text>
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
      }
      if (vault.isYVBoost) {
        apyTooltip = null;
        vaultAssetsTooltip = null;
        apyRecommended = apyPickleRecommended;
        vaultAssets = vaultAssetsPickle;
        //        vaultBalanceOf = 200000330;
        amplifyVaultTitle = (
          <Text bold fontSize={4} mb={40}>
            Zap in to earn compounding yield on a yvBOOST-ETH LP position
          </Text>
        );
        styledIcon = (
          <StyledDoubleTokenIcon>
            {/* NOTE CRV/ETH address for token icon */}
            <StyledTokenIcon address="0x9d409a0A012CFbA9B15F6D4B36Ac57A46966Ab9a" />
            <StyledTokenIcon address="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" />
          </StyledDoubleTokenIcon>
        );
        vaultAdditionalInfo = (
          <Box my={50} mx={isScreenMd ? 50 : 20}>
            <Grid container spacing={isScreenMd ? 8 : 5}>
              <Grid item xs={12} md={6} className="amplify-vault-controls">
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
                <p>
                  This vault performs a multi-step transaction with any asset
                  which:
                </p>
                <ol>
                  <li>1. Makes a deposit into yvBOOST.</li>
                  <li>
                    {`2. Stakes this yvBOOST in the yvBOOST-ETH SLP on SushiSwap
                    for SUSHI 🍣 rewards.`}
                  </li>
                  <li>
                    {`3. Deposits this SLP into the yvBOOST-ETH pJar on Pickle
                    Finance for PICKLE 🥒 rewards.`}
                  </li>
                </ol>
                <p>
                  <span>
                    {`Note: Remember to stake your Pickle LP manually after the
                    transaction completes. If you’d like to claim earned PICKLE
                    🥒 rewards or withdraw yvBOOST-ETH SLP, please, use the UI
                    at `}
                  </span>
                  <a href="https://app.pickle.finance/farms">
                    app.pickle.finance/farms
                  </a>
                </p>{' '}
              </Grid>
            </Grid>
          </Box>
        );
      }
      if (vaultIsPickle && !vault.isYVBoost) {
        availableToDeposit =
          pickleContractsData &&
          pickleContractsData.pickleMasterChefDeposited &&
          !Number.isNaN(pickleContractsData.pickleMasterChefDeposited) &&
          pickleContractsData.pickleMasterChefDeposited !== 'NaN'
            ? pickleContractsData.pickleMasterChefDeposited
            : '0.00';
        const useOldGauge =
          pickleContractsData.pickleMasterChefDeposited < oldPickleGaugeBalance;
        vaultBalanceOf = useOldGauge
          ? oldPickleGaugeBalance
          : pickleContractsData.pickleMasterChefDeposited;
        // TODOoooo
        apyTooltip = null;
        vaultAssets = vaultAssetsPickle;
        vaultAssetsTooltip = null;
        amplifyVaultTitle = (
          <Text bold fontSize={4} mb={40}>
            Migrate your yveCRV-ETH LP into yvBOOST-ETH LP
          </Text>
        );
        styledIcon = (
          <StyledDoubleTokenIcon>
            {/* NOTE CRV/ETH address for token icon */}
            <StyledTokenIcon address="0xc5bDdf9843308380375a611c18B50Fb9341f502A" />
            <StyledTokenIcon address="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" />
          </StyledDoubleTokenIcon>
        );
        vaultAdditionalInfo = (
          <Box my={50} mx={isScreenMd ? 50 : 20}>
            <Grid container spacing={isScreenMd ? 8 : 5}>
              <Grid item xs={12} md={12}>
                {amplifyVaultTitle}
                {vaultControls}
              </Grid>
            </Grid>
          </Box>
        );
      }
      if (vaultIsYvBoost) {
        amplifyVaultTitle = (
          <Text bold fontSize={4} mb={40}>
            Deposit yveCRV or zap in any token to earn compounding 3Crv rewards
          </Text>
        );
        amplifyVaultDesc = (
          <>
            <Text>
              {`This vault holds yveCRV tokens, which grant you a continuous share
            of Curve’s trading fees. Every week, these rewards can be claimed as
            3Crv (Curve’s 3pool LP token). This vault automatically harvests
            these 3Crv rewards and sells them for more yveCRV, compounding your
            returns over time.`}
            </Text>
            <Text>
              {`Deposit the underlying vault asset directly or zap in using
                  almost any token in your wallet. Please be aware that for
                  zaps, we use a default slippage limit of 1% and attempting
                  zaps with low-liquidity tokens may fail. Withdrawals return
                  the vault's underlying token or zap out into one of five
                  supported assets: ETH, WBTC, DAI, USDC, or USDT.`}
            </Text>
          </>
        );
        vaultAdditionalInfo = (
          <Box my={50} mx={isScreenMd ? 50 : 20}>
            <Grid container spacing={isScreenMd ? 8 : 5}>
              <Grid className="amplify-vault-controls" item xs={12} md={7}>
                {amplifyVaultTitle}
                {vaultControls}
              </Grid>
              <Grid
                container
                item
                direction="row"
                alignItems="center"
                xs={12}
                md={5}
              >
                {amplifyVaultDesc}
              </Grid>
            </Grid>
          </Box>
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
              <AnimatedNumber
                value={vaultBalanceOf}
                formatter={vaultBalanceFormatter}
              />
            </Text>
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
              <AnimatedNumber
                value={vaultBalanceOf}
                formatter={vaultBalanceFormatter}
              />
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
              <AnimatedNumber
                value={
                  vault.displayName === 'ETH'
                    ? parsedEthBalance
                    : tokenBalanceOf
                }
              />{' '}
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
  const showCrvUSDN = ['crvUSDN'].includes(vaultName);

  let crvUSDNNotice = null;
  if (showCrvUSDN) {
    crvUSDNNotice = (
      <Notice>
        <NoticeIcon type="info" />
        <span>
          50% of USDN CRV harvest is locked to boost yield. APY displayed
          reflects this.
        </span>
      </Notice>
    );
  }
  let migratableBox = null;
  if (isMigratable) {
    migratableBox = (
      <Box py={24} px={isScreenMd ? '76px' : '16px'}>
        <span>{vaultMigrationData.migrationMessage}</span>
      </Box>
    );
  }

  let zapBox = null;
  const showZapBox = isZappable && !vaultIsYvBoost && !isMigratable;
  if (showZapBox) {
    zapBox = (
      <Box py={24} px={isScreenMd ? '76px' : '16px'}>
        <span>
          {`Deposit the underlying vault asset directly or zap in using
                  almost any token in your wallet. Please be aware that for
                  zaps, we use a default slippage limit of 1% and attempting
                  zaps with low-liquidity tokens may fail. Withdrawals return
                  the vault's underlying token or zap out into one of five
                  supported assets: ETH, WBTC, DAI, USDC, or USDT.`}
        </span>
      </Box>
    );
  }

  let emergencyShutdownNotice = null;
  if (emergencyShutdown) {
    emergencyShutdownNotice = (
      <Notice>
        <NoticeIcon type="info" />
        <span>This vault has been disabled temporarily.</span>
      </Notice>
    );
  }
  let amplifyVaultCard = null;
  if (!amplifyVault)
    amplifyVaultCard = (
      <Card.Footer className={active && 'active'}>
        <Footer small={!isScreenMd}>
          {vaultControls}
          {lazyApeButton}
        </Footer>
      </Card.Footer>
    );

  const minDecimals = setDecimals(decimals);
  const showVaults =
    (!vaultsToHide.includes(vault.address) || balanceOf >= 10 ** minDecimals) &&
    !hackedOrToBeAbsolutelyRemoved.includes(vault.address);
  let finalVaults = null;
  let showLabel = 'SHOW';
  if (isMigratable) {
    showLabel = 'MIGRATE';
  }

  if (showVaults) {
    finalVaults = (
      <React.Fragment>
        <Card
          className={`vault ${amplifyVault ? 'amplify-vault' : ''} ${
            active ? 'active' : ''
          } ${vault.isYVBoost ? 'pickle-vault' : ''}`}
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
              {active ? 'HIDE' : showLabel}
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
              {crvUSDNNotice}
              {migratableBox}
              {zapBox}
              {emergencyShutdownNotice}
              {vaultAdditionalInfo}
              {amplifyVaultCard}
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      </React.Fragment>
    );
  }
  return finalVaults;
};
Vault.whyDidYouRender = false;
export default Vault;
