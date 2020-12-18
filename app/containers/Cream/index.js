import BigNumber from 'bignumber.js';
import { selectContracts, selectContractData } from 'containers/App/selectors';
import {
  selectCollateralEnabled,
  selectBorrowStats,
} from 'containers/Cream/selectors';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { useInjectSaga } from 'utils/injectSaga';
import TokenIcon from 'components/TokenIcon';
import { BLOCKS_PER_YEAR } from './constants';
import saga from './saga';

const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 1200px;
  padding: 50px 40px;
`;

const Td = styled.td`
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
`;

const Table = styled.table`
  font-size: 18px;
  padding-bottom: 20px;
  border-collapse: initial;
  font-family: monospace;
  width: 100%;
  margin-bottom: 2rem;
`;

const TableTitle = styled.h1`
  margin-bottom: 10px;
  padding-top: 20px;
  font-size: 24px;
  text-transform: uppercase;
`;

const TableHeader = styled.th`
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  font-size: 18px;
  text-transform: uppercase;
  text-align: left;
`;

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
`;

function getFieldValue(
  rawValue,
  decimals,
  displayDecimals = 2,
  roundingMode = BigNumber.RoundingMode,
  nanValue = '...',
) {
  const value = new BigNumber(rawValue)
    .dividedBy(10 ** decimals)
    .toFixed(displayDecimals, roundingMode);
  return Number.isNaN(value) ? nanValue : value;
}

const CreamSupplyMarketRow = ({ creamCTokenAddress }) => {
  const creamTokenData = useSelector(selectContractData(creamCTokenAddress));
  const underlyingTokenData = useSelector(
    selectContractData(creamTokenData.underlying),
  );

  const supplyAPY = getFieldValue(
    creamTokenData.supplyRatePerBlock * BLOCKS_PER_YEAR,
    16,
  );
  const walletBalance = getFieldValue(
    underlyingTokenData.balanceOf,
    underlyingTokenData.decimals,
  );
  const exchangeRate = creamTokenData.exchangeRateStored / 10 ** 18;
  const supplied = getFieldValue(
    creamTokenData.balanceOf * exchangeRate,
    underlyingTokenData.decimals,
  );
  const collateralEnabled = useSelector(
    selectCollateralEnabled(creamCTokenAddress),
  );

  const borrowLimitStats = useSelector(selectBorrowStats);
  const borrowLimit = getFieldValue(borrowLimitStats.borrowLimitInUSD, 0, 2);
  const borrowLimitUsedPercent = getFieldValue(
    borrowLimitStats.borrowLimitUsedPercent,
    0,
    2,
  );

  const underlyingSymbol = underlyingTokenData.symbol;

  // Not currently using crETH but if we do...
  // it needs to be special-cased so thats its APY is correct
  // See:
  // https://github.com/iearn-finance/iearn-finance/blob/5e69767606dba65ee01487dfecc08ea3941797ec/src/stores/store.jsx#L4197

  return (
    <tr>
      <Td>
        <IconAndName>
          <StyledTokenIcon address={underlyingTokenData.address} />
          <IconName>
            {underlyingTokenData.symbol || underlyingTokenData.address}
          </IconName>
        </IconAndName>
      </Td>
      <Td>{`${supplyAPY}%`}</Td>
      <Td>{`${walletBalance} ${underlyingSymbol}`}</Td>
      <Td>{`${supplied} ${underlyingSymbol}`}</Td>
      <Td>{`${collateralEnabled ? 'yes' : 'no'}`}</Td>
      <Td>{`$${borrowLimit}`}</Td>
      <Td>{`${borrowLimitUsedPercent}`}%</Td>
    </tr>
  );
};

const CreamBorrowMarketRow = ({ creamCTokenAddress }) => {
  const creamTokenData = useSelector(selectContractData(creamCTokenAddress));
  const underlyingTokenData = useSelector(
    selectContractData(creamTokenData.underlying),
  );

  const borrowAPY = getFieldValue(
    creamTokenData.borrowRatePerBlock * BLOCKS_PER_YEAR,
    16,
  );
  const walletBalance = getFieldValue(
    underlyingTokenData.balanceOf,
    underlyingTokenData.decimals,
  );
  const borrowed = getFieldValue(
    creamTokenData.borrowBalanceStored,
    underlyingTokenData.decimals,
  );
  const liquidity = getFieldValue(
    creamTokenData.getCash,
    underlyingTokenData.decimals,
    2,
    BigNumber.ROUND_DOWN,
  );

  const borrowLimitStats = useSelector(selectBorrowStats);
  const borrowLimit = getFieldValue(borrowLimitStats.borrowLimitInUSD, 0, 2);
  const borrowLimitUsedPercent = getFieldValue(
    borrowLimitStats.borrowLimitUsedPercent,
    0,
    2,
  );

  const underlyingSymbol = underlyingTokenData.symbol;

  // (cyWETH) needs to be special-cased so it's APY is incorrect for now see
  // iearn-finance:src/stores/store.jsx:4197

  return (
    <tr>
      <Td>
        <IconAndName>
          <StyledTokenIcon address={underlyingTokenData.address} />
          <IconName>
            {underlyingTokenData.symbol || underlyingTokenData.address}
          </IconName>
        </IconAndName>
      </Td>
      <Td>{`${borrowAPY}%`}</Td>
      <Td>{`${walletBalance} ${underlyingSymbol}`}</Td>
      <Td>{`${borrowed} ${underlyingSymbol}`}</Td>
      <Td>{`${liquidity} ${underlyingSymbol}`}</Td>
      <Td>{`$${borrowLimit}`}</Td>
      <Td>{`${borrowLimitUsedPercent}`}%</Td>
    </tr>
  );
};

const Cream = () => {
  useInjectSaga({ key: 'cream', saga });

  const creamCTokens = useSelector(selectContracts('creamCTokens'));
  const creamCTokenAddresses = _.map(creamCTokens, token => token.address);

  return (
    <Wrapper>
      <TableTitle>Supply Market</TableTitle>
      <Table>
        <thead>
          <tr>
            <TableHeader>Asset</TableHeader>
            <TableHeader>APY</TableHeader>
            <TableHeader>Wallet</TableHeader>
            <TableHeader>Supplied</TableHeader>
            <TableHeader>Collateral</TableHeader>
            <TableHeader>Borrow limit</TableHeader>
            <TableHeader>Borrow limit used</TableHeader>
          </tr>
        </thead>
        <tbody>
          {creamCTokenAddresses.map(creamCTokenAddress => (
            <CreamSupplyMarketRow
              key={creamCTokenAddress}
              creamCTokenAddress={creamCTokenAddress}
            />
          ))}
        </tbody>
      </Table>

      <TableTitle>Borrow Market</TableTitle>
      <Table>
        <thead>
          <tr>
            <TableHeader>Asset</TableHeader>
            <TableHeader>APY</TableHeader>
            <TableHeader>Wallet</TableHeader>
            <TableHeader>Borrowed</TableHeader>
            <TableHeader>Liquidity</TableHeader>
            <TableHeader>Borrow limit</TableHeader>
            <TableHeader>Borrow limit used</TableHeader>
          </tr>
        </thead>
        <tbody>
          {creamCTokenAddresses.map(creamCTokenAddress => (
            <CreamBorrowMarketRow
              key={creamCTokenAddress}
              creamCTokenAddress={creamCTokenAddress}
            />
          ))}
        </tbody>
      </Table>
    </Wrapper>
  );
};
Cream.whyDidYouRender = true;
export default Cream;
