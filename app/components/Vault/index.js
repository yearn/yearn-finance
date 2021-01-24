import React from 'react';
import { useSelector } from 'react-redux';
import VaultButtons from 'components/VaultButtons';
import VaultControls from 'components/VaultControls';
import styled from 'styled-components';
import AnimatedNumber from 'components/AnimatedNumber';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import ColumnList from 'components/Vault/columns';
import Arrow from 'images/arrow.svg';
import ColumnListDev from 'components/Vault/columnsDev';
import BigNumber from 'bignumber.js';
import { abbreviateNumber } from 'utils/string';
import { selectContractData } from 'containers/App/selectors';
import { getContractType } from 'utils/contracts';
import TokenIcon from 'components/TokenIcon';
import Icon from 'components/Icon';
import { useModal } from 'containers/ModalProvider/hooks';
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

const StyledArrow = styled.img`
  margin-right: 30px;
  transform: ${(props) => (props.expanded ? 'rotate(0)' : 'rotate(-180deg)')};
  transition: transform 0.1s linear;
`;

const A = styled.a`
  display: inline-grid;
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
  padding: 20px;
  width: 100%;
`;

const StatsIcon = styled(Icon)`
  height: 17px;
  position: relative;
  cursor: pointer;
  top: -3px;
  left: -22px;
`;

const truncateApy = (apy) => {
  if (!apy) {
    return 'N/A';
  }
  const truncatedApy = apy && apy.toFixed(2);
  const apyStr = `${truncatedApy}%`;
  return apyStr;
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
  const { vault, showDevVaults, active } = props;
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
    // statistics,
    getPricePerFullShare,
    pricePerShare,
    token,
  } = vault;

  const { openModal } = useModal();

  const devMode = true;
  const tokenContractAddress = tokenAddress || token;
  const tokenContractData = useSelector(
    selectContractData(tokenContractAddress),
  );

  const tokenBalance = _.get(tokenContractData, 'balanceOf');
  const tokenSymbol = tokenSymbolAlias || _.get(tokenContractData, 'symbol');
  // const tokenName = name || _.get(tokenContractData, 'name');

  const vaultName = displayName || name || address;

  const v2Vault = vault.type === 'v2' || vault.apiVersion;

  const apyOneMonthSample = _.get(vault, 'apy.oneMonthSample');
  const apy = truncateApy(apyOneMonthSample * 100);
  const tokenBalanceOf = new BigNumber(tokenBalance)
    .dividedBy(10 ** decimals)
    .toFixed();

  let vaultBalanceOf;
  if (v2Vault) {
    vaultBalanceOf = new BigNumber(balanceOf)
      .dividedBy(10 ** decimals)
      .multipliedBy(pricePerShare / 10 ** decimals)
      .toFixed();
  } else {
    vaultBalanceOf = new BigNumber(balanceOf)
      .dividedBy(10 ** decimals)
      .multipliedBy(getPricePerFullShare / 10 ** 18)
      .toFixed();
  }

  let vaultAssets = balance || totalAssets;
  vaultAssets = new BigNumber(vaultAssets).dividedBy(10 ** decimals).toFixed(0);
  vaultAssets = vaultAssets === 'NaN' ? '-' : abbreviateNumber(vaultAssets);
  const contractType = getContractType(vault);

  let vaultBottom;
  let vaultTop;
  let vaultControls;

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
    vaultTop = (
      <ColumnList>
        <IconAndName>
          <LinkWrap devMode={devMode} address={address}>
            <StyledTokenIcon address={tokenContractAddress} />
          </LinkWrap>
          <LinkWrap devMode={devMode} address={address}>
            <div tw="flex items-center">
              <IconName devMode={devMode}>{vaultName}</IconName>
            </div>
          </LinkWrap>
        </IconAndName>
        <div>{vault.type}</div>
        <div>
          <AnimatedNumber value={vaultBalanceOf} />
        </div>
        <div>{apy}</div>
        <div>{vaultAssets}</div>
        <div>
          <AnimatedNumber value={tokenBalanceOf} />{' '}
          <LinkWrap devMode={devMode} address={tokenAddress}>
            {tokenSymbol}
          </LinkWrap>
        </div>
      </ColumnList>
    );
  }
  return (
    <React.Fragment>
      <Card className={active && 'active'}>
        <Accordion.Toggle as={Card.Header} variant="link" eventKey={address}>
          {vaultTop}
          <StatsIcon type="stats" onClick={openContractStatisticsModal} />
          <StyledArrow src={Arrow} alt="arrow" expanded={active} />
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={address}>
          <Card.Body>
            {vaultBottom}
            <Card.Footer className={active && 'active'}>
              <Footer>{vaultControls}</Footer>
            </Card.Footer>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </React.Fragment>
  );
};
Vault.whyDidYouRender = false;
export default Vault;
