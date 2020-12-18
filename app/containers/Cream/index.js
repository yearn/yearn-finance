import BigNumber from 'bignumber.js';
import { selectContracts, selectContractData } from 'containers/App/selectors';
import { selectCollateralEnabled, selectBorrowStats } from 'containers/Cream/selectors';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { useInjectSaga } from 'utils/injectSaga';
import { BLOCKS_PER_YEAR } from './constants';
import saga from './saga';

const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 1200px;
  padding: 50px 40px;
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

  const supplyAPY = getFieldValue(creamTokenData.supplyRatePerBlock * BLOCKS_PER_YEAR, 16);
  const walletBalance = getFieldValue(underlyingTokenData.balanceOf, underlyingTokenData.decimals);
  const exchangeRate = creamTokenData.exchangeRateStored / 10 ** 18;
  const supplied = getFieldValue(creamTokenData.balanceOf * exchangeRate, underlyingTokenData.decimals);
  const collateralEnabled = useSelector(selectCollateralEnabled(creamCTokenAddress));

  const borrowLimitStats = useSelector(selectBorrowStats);
  const borrowLimit = getFieldValue(borrowLimitStats.borrowLimitInUSD, 0, 2);
  const borrowLimitUsedPercent = getFieldValue(borrowLimitStats.borrowLimitUsedPercent, 0, 2);

  const underlyingSymbol = underlyingTokenData.symbol;

  // Not currently using crETH but if we do...
  // it needs to be special-cased so thats its APY is correct
  // See:
  // https://github.com/iearn-finance/iearn-finance/blob/5e69767606dba65ee01487dfecc08ea3941797ec/src/stores/store.jsx#L4197

  return (
    <tr>
      <td>{underlyingTokenData.symbol}</td>
      <td>{`${supplyAPY}%`}</td>
      <td>{`${walletBalance} ${underlyingSymbol}`}</td>
      <td>{`${supplied} ${underlyingSymbol}`}</td>
      <td>{`${collateralEnabled}`}</td>
      <td>{`${borrowLimit}`}</td>
      <td>{`${borrowLimitUsedPercent}`}</td>
    </tr>
  );
};

const CreamBorrowMarketRow = ({ creamCTokenAddress }) => {
  const creamTokenData = useSelector(selectContractData(creamCTokenAddress));
  const underlyingTokenData = useSelector(
    selectContractData(creamTokenData.underlying),
  );

  const borrowAPY = getFieldValue(creamTokenData.borrowRatePerBlock * BLOCKS_PER_YEAR, 16);
  const walletBalance = getFieldValue(underlyingTokenData.balanceOf, underlyingTokenData.decimals);
  const borrowed = getFieldValue(creamTokenData.borrowBalanceStored, underlyingTokenData.decimals);
  const liquidity = getFieldValue(
    creamTokenData.getCash,
    underlyingTokenData.decimals,
    2,
    BigNumber.ROUND_DOWN,
  );

  const borrowLimitStats = useSelector(selectBorrowStats);
  const borrowLimit = getFieldValue(borrowLimitStats.borrowLimitInUSD, 0, 2);
  const borrowLimitUsedPercent = getFieldValue(borrowLimitStats.borrowLimitUsedPercent, 0, 2);

  const underlyingSymbol = underlyingTokenData.symbol;

  // (cyWETH) needs to be special-cased so it's APY is incorrect for now see
  // iearn-finance:src/stores/store.jsx:4197

  return (
    <tr>
      <td>{underlyingTokenData.symbol}</td>
      <td>{`${borrowAPY}%`}</td>
      <td>{`${walletBalance} ${underlyingSymbol}`}</td>
      <td>{`${borrowed} ${underlyingSymbol}`}</td>
      <td>{`${liquidity} ${underlyingSymbol}`}</td>
      <td>{`${borrowLimit}`}</td>
      <td>{`${borrowLimitUsedPercent}`}</td>
    </tr>
  );
};

const Cream = () => {
    useInjectSaga({ key: 'cream', saga });

    const creamCTokens = useSelector(selectContracts('creamCTokens'));
    const creamCTokenAddresses = _.map(creamCTokens, token => token.address);

    return (
      <Wrapper>
        <h1>Supply Market</h1>
        <table style={{ width: '100%' }}>
          <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Asset</th>
            <th style={{ textAlign: 'left' }}>APY</th>
            <th style={{ textAlign: 'left' }}>Wallet</th>
            <th style={{ textAlign: 'left' }}>Supplied</th>
            <th style={{ textAlign: 'left' }}>Collateral enabled</th>
            <th style={{ textAlign: 'left' }}>Borrow limit</th>
            <th style={{ textAlign: 'left' }}>Borrow limit used %</th>
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
        </table>


        <h1>Borrow Market</h1>
        <table style={{ width: '100%' }}>
          <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Asset</th>
            <th style={{ textAlign: 'left' }}>APY</th>
            <th style={{ textAlign: 'left' }}>Wallet</th>
            <th style={{ textAlign: 'left' }}>Borrowed</th>
            <th style={{ textAlign: 'left' }}>Liquidity</th>
            <th style={{ textAlign: 'left' }}>Borrow limit</th>
            <th style={{ textAlign: 'left' }}>Borrow limit used %</th>
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
        </table>
      </Wrapper>
    );
  }
;

Cream.whyDidYouRender = true;
export default Cream;
