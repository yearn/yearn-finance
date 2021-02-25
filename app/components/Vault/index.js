import React from 'react';
import { useSelector } from 'react-redux';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ColumnListBackscratcher from 'components/Vault/backscratcherColumns';
import VaultButtons from 'components/VaultButtons';
import VaultControls from 'components/VaultControls';
import styled from 'styled-components';
import AnimatedNumber from 'components/AnimatedNumber';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import ColumnList from 'components/Vault/columns';
import ColumnListDev from 'components/Vault/columnsDev';
import BigNumber from 'bignumber.js';
import { abbreviateNumber } from 'utils/string';
import { selectContractData, selectEthBalance } from 'containers/App/selectors';
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

const IconAndName = styled.div`
  display: flex;
  align-items: center;
`;

const StyledTokenIcon = styled(TokenIcon)`
  width: 40px;
  margin-right: 20px;
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
  padding: ${({ small }) => (small ? '8px 20px' : '10px 20px')} !important;
  width: 100%;
`;

const StatsIcon = styled(Icon)`
  height: 17px;
  position: relative;
  cursor: pointer;
  top: -3px;
  left: -22px;
`;

const InfoIcon = styled(Icon)`
  display: inline-block;
  margin-left: 3px;
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
  padding: 1em 0;
  display: flex;
  justify-content: center;
  width: 100%;
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

const truncateFee = (fee) => {
  if (!fee) {
    return 'N/A';
  }
  const truncatedFee = (fee / 1e4).toFixed(2);
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

const ApyErrorDescriptions = {
  'no harvests': {
    recommended: 'NEW ✨',
    tooltip:
      'This vault was just added or recently updated its strategy. APY data will be displayed after the first four harvests.',
  },
};

const LinkWrap = (props) => {
  const { devMode, children, address } = props;
  if (!devMode) {
    return children || null;
  }
  return (
    <A
      href={`https://etherscan.io/address/${address}`}
      target="_blank"
      onClick={(evt) => evt.stopPropagation()}
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
    backscratcherVault,
  } = props;
  const vaultContractData = useSelector(selectContractData(vault.address));
  _.merge(vault, vaultContractData);
  const {
    tokenAddress,
    tokenSymbolAlias,
    decimals,
    displayName,
    totalAssets,
    balance,
    balanceOf,
    address,
    name,
    getPricePerFullShare,
    pricePerShare,
    token,
    pureEthereum,
    CRV,
    multiplier,
    depositLimit,
    // statistics,
  } = vault;

  const { openModal } = useModal();
  const isScreenMd = useMediaQuery('(min-width:960px)');

  const devMode = true;
  const tokenContractAddress = token.address || CRV;
  const ethBalance = useSelector(selectEthBalance());
  const tokenContractData = useSelector(
    selectContractData(tokenContractAddress),
  );

  const backscratcherAddress = '0xc5bDdf9843308380375a611c18B50Fb9341f502A';
  const veCrvAddress = '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2';

  const veCrvContract = useSelector(selectContractData(veCrvAddress));

  const backscratcherTotalAssets = veCrvContract.balanceOf;

  const vaultIsBackscratcher = vault.address === backscratcherAddress;

  let tokenBalance = _.get(tokenContractData, 'balanceOf');
  if (pureEthereum) {
    tokenBalance = ethBalance;
  }

  const tokenSymbol = tokenSymbolAlias || _.get(tokenContractData, 'symbol');
  // const tokenName = name || _.get(tokenContractData, 'name');

  const backscratcherVaultName = vaultIsBackscratcher && 'yveCRV';
  const vaultName = backscratcherVaultName || displayName || name || address;

  const v2Vault = vault.type === 'v2' || vault.apiVersion;

  const { apy } = vault;

  const apyType = apy && apy.type;
  let apyRecommended =
    apyType !== 'error'
      ? truncateApy(_.get(apy, 'recommended'))
      : ApyErrorDescriptions[apy.description].recommended;

  const grossApy = _.get(apy, 'data.grossApy');
  const netApy = _.get(apy, 'data.netApy');
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
    apyTooltip = ApyErrorDescriptions[apy.description].tooltip;
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
            <tr>
              <td>Base CRV APR</td>
              <td>{truncateApy(apy.data.baseApr)}</td>
            </tr>
            <tr>
              <td>Boost</td>
              <td>{apy.data.currentBoost.toFixed(2)}x</td>
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
                <td>{truncateFee(withdrawalFee * 100)}</td>
              </tr>
              <tr>
                <td>Performance Fee</td>
                <td>{truncateFee(performanceFee * 100)}</td>
              </tr>
              {keepCrv && (
                <tr>
                  <td>Locked CRV</td>
                  <td>{truncateFee(keepCrv * 100)}</td>
                </tr>
              )}
            </tbody>
          </TooltipTable>
        </div>
      );
    }
  }

  if (address === '0xBA2E7Fed597fd0E3e70f5130BcDbbFE06bB94fe1') {
    // yfi vault
    apyRecommended = 'N/A';
    apyTooltip = 'Inactive with YIP-56: Buyback and Build';
  } else if (address === '0xFe39Ce91437C76178665D64d7a2694B0f6f17fE3') {
    // usdn vault
    apyRecommended = truncateApy(apy.data.netApy);
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

  let vaultAssets = vaultIsBackscratcher
    ? backscratcherTotalAssets
    : balance || totalAssets;
  vaultAssets = new BigNumber(vaultAssets).dividedBy(10 ** decimals).toFixed(0);
  vaultAssets = vaultAssets === 'NaN' ? '-' : abbreviateNumber(vaultAssets);

  if (v2Vault && depositLimit && vaultAssets !== 'NaN') {
    const limit = new BigNumber(depositLimit)
      .dividedBy(10 ** decimals)
      .toFixed(0);
    if (parseInt(limit, 10) < Number.MAX_SAFE_INTEGER) {
      vaultAssets = `${vaultAssets} / ${abbreviateNumber(limit)}`;
    }
  }

  const contractType = getContractType(vault);

  let vaultBottom;
  let vaultTop;
  // eslint-disable-next-line no-unused-vars
  let vaultStats;
  let vaultControls;
  let backscratcherInfo;

  const openContractStatisticsModal = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    openModal('contractStatistics', { vault });
  };

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
            <StyledTokenIcon address={tokenContractAddress} />
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
      />
    );
    const tokenIconAddress = vaultIsBackscratcher
      ? backscratcherAddress
      : tokenContractAddress;

    if (backscratcherVault) {
      vaultTop = (
        <ColumnListBackscratcher gridTemplate={isScreenMd ? null : '190px'}>
          <IconAndName>
            <LinkWrap devMode={devMode} address={address}>
              <StyledTokenIcon address={tokenIconAddress} />
            </LinkWrap>
            <LinkWrap devMode={devMode} address={address}>
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
              <AnimatedNumber value={vaultBalanceOf} />
            </Text>
            <Text large bold>
              {multiplier}
            </Text>
            <Text large bold>
              <Tooltip title={apyTooltip} arrow>
                <span>
                  <Apy>{apyRecommended}</Apy> <InfoIcon type="info" />
                </span>
              </Tooltip>
            </Text>
            <Text large bold>
              {vaultAssets}
            </Text>
            <Text large bold>
              <AnimatedNumber value={tokenBalanceOf} />{' '}
              <LinkWrap devMode={devMode} address={tokenAddress}>
                {tokenSymbol}
              </LinkWrap>
            </Text>
          </Hidden>
        </ColumnListBackscratcher>
      );

      backscratcherInfo = (
        <Box my={16} mx={isScreenMd ? 70 : 20}>
          <Text bold fontSize={4} mb={6}>
            Read carefully before use
          </Text>
          <Grid container spacing={isScreenMd ? 8 : 0}>
            <Grid item xs={12} md={6}>
              <Text large>
                This vault converts your CRV into yveCRV, earning you a
                continuous share of Curve fees. The more converted, the greater
                the rewards. Every week, these can be claimed from the vault as
                3Crv (Curve’s 3pool LP token).
              </Text>
            </Grid>
            <Grid item xs={12} md={6}>
              <Text large>
                The operation is non-reversible: You can only convert CRV into
                yveCRV, as the CRV is perpetually staked in Curve{"'"}s voting
                escrow.
                <br />
                <br />
                After depositing join{' '}
                <A
                  href="https://app.sushiswap.fi/token/0xc5bddf9843308380375a611c18b50fb9341f502a"
                  target="_blank"
                >
                  WETH/yveCRV-DAO pool
                </A>{' '}
                for 🍣 rewards and then{' '}
                <A href="https://app.pickle.finance/jars" target="_blank">
                  SLP YVECRV/ETH jar
                </A>{' '}
                for 🥒 rewards.
              </Text>
            </Grid>
          </Grid>
        </Box>
      );
    } else {
      vaultTop = (
        <ColumnList gridTemplate={isScreenMd ? null : '210px'}>
          <IconAndName>
            <LinkWrap devMode={devMode} address={address}>
              <StyledTokenIcon address={tokenIconAddress} />
            </LinkWrap>
            <LinkWrap devMode={devMode} address={address}>
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
                  <div>
                    {vault.type} <InfoIcon type="info" />
                  </div>
                </Tooltip>
              ) : (
                vault.type
              )}
            </Text>
            <Text large bold>
              <AnimatedNumber value={vaultBalanceOf} />
            </Text>

            <Text large bold>
              <Tooltip title={apyTooltip} arrow>
                <span>
                  <Apy>{apyRecommended}</Apy> <InfoIcon type="info" />
                </span>
              </Tooltip>
            </Text>

            <Text large bold>
              {vaultAssets}
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
      <Card className={active && 'active'} id={`vault-${accordionKey}`}>
        <Accordion.Toggle
          as={Card.Header}
          variant="link"
          eventKey={accordionKey}
        >
          {vaultTop}
          {/* {vaultStats} */}
          <StyledText fontWeight={600} mr={20}>
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
            {backscratcherInfo}
            <Card.Footer className={active && 'active'}>
              <Footer small={!isScreenMd}>{vaultControls}</Footer>
            </Card.Footer>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </React.Fragment>
  );
};
Vault.whyDidYouRender = false;
export default Vault;
