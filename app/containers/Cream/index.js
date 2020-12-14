import { selectContractData } from 'containers/App/selectors';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import BigNumber from 'bignumber.js';
import reducer from './reducer';
import saga from './saga';
import { BLOCKS_PER_YEAR } from './constants';

const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 1200px;
  padding: 50px 40px;
`;

const CreamBorrowMarketRow = ({ creamTokenAddress }) => {
  const creamTokenData = useSelector(selectContractData(creamTokenAddress));

  console.log(creamTokenData);

  const borrowRatePerYear =
    (creamTokenData.borrowRatePerBlock * BLOCKS_PER_YEAR) / 1e16;

  // (cyWETH) needs to be special-cased so it's APY is incorrect for now see
  // iearn-finance:src/stores/store.jsx:4197

  return (
    <tr>
      <td>Token Name</td>
      <td>{borrowRatePerYear}</td>
    </tr>
  );
};

const Cream = () => {
  useInjectSaga({ key: 'cream', saga });
  useInjectReducer({ key: 'cream', reducer });

  // Hardcoding cream token address temporarily until added to store.
  // Actual contracts are syncing and stored, but list of addresses to loop over
  // are yet to be stored.
  // Started to look at this in app reducer, but backed off as wasn't sure about
  // affecting the ready state if cream data does not start loading until user
  // visits its page.
  const creamTokenAddresses = [
    '0x41c84c0e2EE0b740Cf0d31F63f3B6F627DC6b393',
    '0x8e595470Ed749b85C6F7669de83EAe304C2ec68F',
    '0x7589C9E17BCFcE1Ccaa1f921196FDa177F0207Fc',
  ];

  return (
    <Wrapper>
      <table>
        <thead>
          <tr>
            <th>Asset</th>
            <th>APY</th>
            <th>Wallet</th>
            <th>Liquidity</th>
          </tr>
        </thead>
        <tbody>
          {creamTokenAddresses.map(creamTokenAddress => (
            <CreamBorrowMarketRow
              key={creamTokenAddress}
              creamTokenAddress={creamTokenAddress}
            />
          ))}
        </tbody>
      </table>
    </Wrapper>
  );
};

Cream.whyDidYouRender = true;
export default Cream;
