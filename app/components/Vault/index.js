import React, { memo } from 'react';
import { compose } from 'redux';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import AnimatedNumber from 'components/AnimatedNumber';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import ColumnList from 'components/Vault/columns';
import Arrow from 'images/arrow.svg';
import ColumnListDev from 'components/Vault/columnsDev';
import BigNumber from 'bignumber.js';
import { abbreviateNumber } from 'utils/string';
import { selectDevMode } from 'containers/DevMode/selectors';
import { selectContractData } from 'containers/App/selectors';
import { getContractType } from 'utils/contracts';
import VaultButtons from 'components/VaultButtons';
import TokenIcon from 'components/TokenIcon';
import Icon from 'components/Icon';
import { useModal } from 'containers/ModalProvider/hooks';
import tw, { theme } from 'twin.macro';

const formatVaultStatistic = stat => {
  switch (stat) {
    // depositedAmount: "0"
    //         depositedShares: "0"
    //         earnings: "1534851627416"
    //         totalDeposits: "285159143497674298"
    //         totalTransferredIn: "0"
    //         totalTransferredOut: "0"
    //         totalWithdrawals: "285160678349301714"

    case 'depositedAmount': {
      return 'Available to withdraw';
    }
    case 'depositedShares': {
      return 'Deposited Shares';
    }
    case 'totalDeposits': {
      return 'Total Deposits';
    }
    case 'totalTransferredIn': {
      return 'Total Transferred In';
    }
    case 'totalTransferredOut': {
      return 'Total Transferred Out';
    }
    case 'totalWithdrawals': {
      return 'Total Withdrawals';
    }
    case 'earnings': {
      return 'Historical Earnings';
    }
    default: {
      return '';
    }
  }
};

const statisticsToShow = [
  'earnings',
  'totalDeposits',
  'totalWithdrawals',
  'depositedAmount',
];

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
  padding-right: 10px;
  text-overflow: ellipsis;
  &:hover {
    color: ${theme('colors.yearn.blue')};
  }
`;

const StyledArrow = styled.img`
  margin-right: 30px;
  transform: ${props => (props.expanded ? 'rotate(0)' : 'rotate(-180deg)')};
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
`;

const StatsIcon = styled(Icon)`
  height: 17px;
  position: relative;
  cursor: pointer;
  top: -3px;
  left: -22px;
`;

const truncateApy = apy => {
  if (!apy) {
    return 'N/A';
  }
  const truncatedApy = apy && apy.toFixed(2);
  const apyStr = `${truncatedApy}%`;
  return apyStr;
};

const LinkWrap = props => {
  const { devMode, children, address } = props;
  if (!devMode) {
    return children;
  }
  return (
    <A
      href={`https://etherscan.io/address/${address}`}
      target="_blank"
      onClick={evt => evt.stopPropagation()}
    >
      {children}
    </A>
  );
};

const Vault = props => {
  const [isHovered, setIsHovered] = React.useState(false);
  const { vault, showDevVaults, active } = props;
  const vaultContractData = useSelector(selectContractData(vault.address));
  _.merge(vault, vaultContractData);
  const {
    tokenAddress,
    tokenSymbolAlias,
    decimals,
    token,
    name,
    totalAssets,
    balance,
    balanceOf,
    address,
    vaultAlias,
    statistics,
  } = vault;

  const { openModal } = useModal();

  const devMode = useSelector(selectDevMode());
  const tokenContractAddress = tokenAddress || token;
  const tokenContractData = useSelector(
    selectContractData(tokenContractAddress),
  );

  const tokenBalance = _.get(tokenContractData, 'balanceOf');
  const tokenSymbol = tokenSymbolAlias || _.get(tokenContractData, 'symbol');
  const tokenName = name || _.get(tokenContractData, 'name');

  const vaultName = vaultAlias || name;

  const apyOneMonthSample = _.get(vault, 'apy.apyOneMonthSample');
  const apy = truncateApy(apyOneMonthSample);
  const tokenBalanceOf = new BigNumber(tokenBalance)
    .dividedBy(10 ** decimals)
    .toFixed();
  const vaultBalanceOf = new BigNumber(balanceOf)
    .dividedBy(10 ** decimals)
    .toFixed();
  let vaultAssets = balance || totalAssets;
  vaultAssets = new BigNumber(vaultAssets).dividedBy(10 ** decimals).toFixed(0);
  vaultAssets = vaultAssets === 'NaN' ? '-' : abbreviateNumber(vaultAssets);
  const contractType = getContractType(vault);

  let vaultBottom;
  let vaultTop;

  const openContractStatisticsModal = evt => {
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
            formatter={v => new BigNumber(v).toFixed(0)}
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
          {isHovered ? (
            <LinkWrap devMode={devMode} address={address}>
              <IconName
                onMouseLeave={() => setIsHovered(false)}
                devMode={devMode}
              >
                {tokenName}
              </IconName>
            </LinkWrap>
          ) : (
            <>
              <LinkWrap devMode={devMode} address={address}>
                <StyledTokenIcon address={tokenContractAddress} />
              </LinkWrap>
              <LinkWrap devMode={devMode} address={address}>
                <div
                  tw="flex"
                  onMouseLeave={() => setIsHovered(false)}
                  onMouseEnter={() => setIsHovered(true)}
                >
                  <IconName devMode={devMode}>{vaultName}</IconName>
                  <Icon type="info" />
                </div>
              </LinkWrap>
            </>
          )}
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
    const formattedUserVaultStatistics =
      statistics &&
      Object.keys(statistics)
        .filter(statistic => statisticsToShow.find(show => show === statistic))
        .map(statistic => {
          const formattedValue = new BigNumber(statistics[statistic])
            .dividedBy(10 ** decimals)
            .toFixed(8);

          return {
            name: formatVaultStatistic(statistic),
            value: formattedValue > 0 ? formattedValue : 0,
          };
        });

    const formattedUserVaultStatisticsEarnings =
      statistics &&
      formattedUserVaultStatistics.map(earning => (
        <div key={earning.name}>
          <p tw="font-sans font-bold text-lg text-white">{earning.value}</p>
          <p tw="font-sans font-medium text-sm opacity-50">{earning.name}</p>
        </div>
      ));

    const defaultZeroUserVaultStatisticsEarnings = statisticsToShow.map(
      statistic => (
        <div key={statistic}>
          <p tw="font-sans font-bold text-lg text-white">0</p>
          <p tw="font-sans font-medium text-sm opacity-50">
            {formatVaultStatistic(statistic)}
          </p>
        </div>
      ),
    );
    vaultBottom = (
      <ColumnList css={[tw`py-6`]}>
        <div>
          <p tw="font-sans font-bold text-xl text-white">Earnings: </p>
        </div>
        {statistics
          ? formattedUserVaultStatisticsEarnings
          : defaultZeroUserVaultStatisticsEarnings}
      </ColumnList>
    );
    vaultTop = (
      <ColumnList>
        <IconAndName>
          {isHovered ? (
            <LinkWrap devMode={devMode} address={address}>
              <IconName
                onMouseLeave={() => setIsHovered(false)}
                devMode={devMode}
              >
                {tokenName}
              </IconName>
            </LinkWrap>
          ) : (
            <>
              <LinkWrap devMode={devMode} address={address}>
                <StyledTokenIcon address={tokenContractAddress} />
              </LinkWrap>
              <LinkWrap devMode={devMode} address={address}>
                <div
                  tw="flex items-center"
                  onMouseLeave={() => setIsHovered(false)}
                  onMouseEnter={() => setIsHovered(true)}
                >
                  <IconName devMode={devMode}>{vaultName}</IconName>
                  <div tw="h-4 w-4">
                    <Icon type="info" />
                  </div>
                </div>
              </LinkWrap>
            </>
          )}
        </IconAndName>
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
              <Footer>
                <VaultButtons
                  vault={vault}
                  token={tokenContractData}
                  showDevVaults={showDevVaults}
                />
              </Footer>
            </Card.Footer>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </React.Fragment>
  );
};
Vault.whyDidYouRender = false;
export default compose(memo)(Vault);
