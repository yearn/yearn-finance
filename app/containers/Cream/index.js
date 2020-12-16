import BigNumber from 'bignumber.js';
import { selectContracts, selectContractData } from 'containers/App/selectors';
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

const CreamBorrowMarketRow = ({ creamCTokenAddress }) => {
  const creamTokenData = useSelector(selectContractData(creamCTokenAddress));
  const underlyingTokenData = useSelector(
    selectContractData(creamTokenData.underlying),
  );

  const borrowRatePerYear = getFieldValue(
    creamTokenData.borrowRatePerBlock * BLOCKS_PER_YEAR,
    16,
  );
  const walletBalance = getFieldValue(
    underlyingTokenData.balanceOf,
    underlyingTokenData.decimals,
  );
  const liquidity = getFieldValue(
    creamTokenData.getCash,
    underlyingTokenData.decimals,
    2,
    BigNumber.ROUND_DOWN,
  );

  // (cyWETH) needs to be special-cased so it's APY is incorrect for now see
  // iearn-finance:src/stores/store.jsx:4197

  return (
    <tr>
      <td>{underlyingTokenData.symbol}</td>
      <td>{`${borrowRatePerYear}%`}</td>
      <td>{`${walletBalance} ${underlyingTokenData.symbol}`}</td>
      <td>{liquidity}</td>
    </tr>
  );
};

const Cream = () => {
  useInjectSaga({ key: 'cream', saga });

  const creamCTokens = useSelector(selectContracts('creamCTokens'));
  const creamCTokenAddresses = _.map(creamCTokens, token => token.address);

  return (
    <Wrapper>
      <h1>Borrow Market</h1>
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Asset</th>
            <th style={{ textAlign: 'left' }}>APY</th>
            <th style={{ textAlign: 'left' }}>Wallet</th>
            <th style={{ textAlign: 'left' }}>Liquidity</th>
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
};

Cream.whyDidYouRender = true;
export default Cream;
