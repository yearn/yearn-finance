import React, { useEffect } from 'react';

import {
  selectCreamTokensInfo,
  selectCreamGroupedInfo,
} from 'containers/Cream/selectors';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { useInjectSaga } from 'utils/injectSaga';
import TokenIcon from 'components/TokenIcon';
import Table from 'components/Table';
import { useModal } from 'containers/ModalProvider/hooks';
import IconButton from 'components/IconButton';
import { useSelector, useDispatch } from 'react-redux';
import InfoCard from 'components/InfoCard';
import ButtonFilled from 'components/ButtonFilled';
import { useContract } from 'containers/DrizzleProvider/hooks';
import { COMPTROLLER_ADDRESS } from 'containers/Cream/constants';
import saga from './saga';
import { initializeCream, creamEnterMarkets } from './actions';
// import { useAccount, useWeb3 } from 'containers/ConnectionProvider/hooks';
// import { BigNumber } from 'bignumber.js';

// const MAX_UINT256 = new BigNumber(2).pow(256).minus(1).toFixed(0);

const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 1088px;
`;

const IconAndName = styled.div`
  display: flex;
  align-items: center;
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

const Cards = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-column-gap: 16px;
  margin-bottom: 32px;
`;

const Buttons = styled.div`
  display: inline-flex;
  grid-gap: 12px;
`;

const tokenTransform = (_val, row) => {
  const { address, symbol } = row;

  return (
    <IconAndName>
      <StyledTokenIcon address={address} />
      <IconName>{symbol || address}</IconName>
    </IconAndName>
  );
};

const formatAmount = (amount, decimals) =>
  `${Number(amount, 10).toFixed(decimals)}`;

const numberTransform = (val) => `${formatAmount(val, 5)}`;
const percentTransform = (val) => `${formatAmount(val, 2)}%`;

// const tokenSymbolTransform = (val, row) =>
//   `${val} ${row.asset.symbol[0].value}`;

// const dollarTransform = val => `$${val}`;

export default function Cream() {
  useInjectSaga({ key: 'cream', saga });
  const dispatch = useDispatch();
  // const web3 = useWeb3();
  // const account = useAccount();

  const initialize = () => {
    dispatch(initializeCream());
  };
  useEffect(initialize, []);

  const creamTokensInfo = useSelector(selectCreamTokensInfo);
  const creamGroupedInfo = useSelector(selectCreamGroupedInfo);
  const creamComptrollerContract = useContract(COMPTROLLER_ADDRESS);
  const { openModal } = useModal();

  const supplyDataSorted = _.orderBy(creamTokensInfo, 'supplied', 'desc');
  const borrowDataSorted = _.orderBy(creamTokensInfo, 'borrowed', 'desc');

  const borrowedData = _.filter(borrowDataSorted, (data) => data.borrowed > 0);
  const suppliedData = _.filter(supplyDataSorted, (data) => data.supplied > 0);

  if (!borrowedData || !suppliedData) {
    return null;
  }

  const actionHandler = (row) => {
    openModal('cream', { ...row, ...creamGroupedInfo });
  };

  const borrowActionsTransform = (val, row) => {
    let withdrawButton;
    if (row.borrowed > 0) {
      withdrawButton = (
        <IconButton
          iconType="arrowUpAlt"
          onClick={() => actionHandler({ ...row, action: 'repay' })}
        >
          Repay
        </IconButton>
      );
    }
    return (
      <Buttons>
        {withdrawButton}
        <IconButton
          iconType="arrowDownAlt"
          onClick={() => actionHandler({ ...row, action: 'borrow' })}
        >
          Borrow
        </IconButton>
      </Buttons>
    );
  };

  const allActionsTransform = (_val, row) => {
    const creamCTokenAddress = _.get(row, 'cAddress');
    const marketEntered = _.get(row, 'collateralEnabled');

    return (
      <>
        {marketEntered ? (
          <Buttons>
            <IconButton
              iconType="arrowUpAlt"
              onClick={() => actionHandler({ ...row, action: 'supply' })}
            >
              Supply
            </IconButton>
            <IconButton
              iconType="arrowDownAlt"
              onClick={() => actionHandler({ ...row, action: 'borrow' })}
            >
              Borrow
            </IconButton>
          </Buttons>
        ) : (
          <ButtonFilled
            variant="contained"
            color="primary"
            onClick={() => {
              if (marketEntered) {
                // TODO: Exit Market, meh
                return;
              }
              dispatch(
                creamEnterMarkets({
                  creamCTokenAddress,
                  creamComptrollerContract,
                }),
              );
            }}
          >
            Enter Market/Enable
          </ButtonFilled>
        )}
      </>
    );
  };

  const supplyActionsTransform = (val, row) => {
    let withdrawButton;
    if (row.supplied > 0) {
      withdrawButton = (
        <IconButton
          iconType="arrowDownAlt"
          onClick={() => actionHandler({ ...row, action: 'withdraw' })}
        >
          Withdraw
        </IconButton>
      );
    }
    return (
      <Buttons>
        {withdrawButton}
        <IconButton
          iconType="arrowUpAlt"
          onClick={() => actionHandler({ ...row, action: 'supply' })}
        >
          Supply
        </IconButton>
      </Buttons>
    );
  };

  const supplyTable = {
    title: 'Assets Supplied',
    columns: [
      { key: 'asset', transform: tokenTransform },
      {
        key: 'supplied',
        transform: numberTransform,
      },
      {
        key: 'balance',
        alias: 'Balance',
        transform: numberTransform,
      },
      {
        key: 'supplyAPY',
        alias: 'Supply APY',
        transform: percentTransform,
      },
      {
        key: 'actions',
        alias: 'Actions',
        transform: supplyActionsTransform,
      },
    ],
    rows: suppliedData,
  };

  const borrowTable = {
    title: 'Assets Borrowed',
    columns: [
      { key: 'asset', transform: tokenTransform },
      {
        key: 'borrowed',
        transform: numberTransform,
      },
      {
        key: 'balance',
        alias: 'Balance',
        transform: numberTransform,
      },
      {
        key: 'borrowAPY',
        alias: 'Borrow APY',
        transform: percentTransform,
      },
      {
        key: 'actions',
        alias: 'Actions',
        transform: borrowActionsTransform,
      },
    ],
    rows: borrowedData,
  };

  const allAssetsTable = {
    title: 'All Assets',
    columns: [
      { key: 'asset', transform: tokenTransform },
      {
        key: 'balance',
        alias: 'Balance',
        transform: numberTransform,
      },
      {
        key: 'supplyAPY',
        alias: 'Supply APY',
        transform: percentTransform,
      },
      {
        key: 'borrowAPY',
        alias: 'Borrow APY',
        transform: percentTransform,
      },
      {
        key: 'actions',
        alias: 'Actions',
        transform: allActionsTransform,
      },
    ],
    rows: borrowDataSorted,
  };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

  const dollarFormatter = (val) => formatter.format(val);
  const percentageFormatter = (val) => `${parseInt(val, 10).toFixed(0)}%`;

  const {
    totalSupplied,
    totalBorrowed,
    borrowUtilizationRatio,
  } = creamGroupedInfo;

  return (
    <Wrapper>
      <Cards>
        <InfoCard
          label="Supply Balance"
          value={totalSupplied}
          formatter={dollarFormatter}
        />
        <InfoCard
          label="Borrow Balance"
          value={totalBorrowed}
          formatter={dollarFormatter}
        />
        <InfoCard
          label="Borrow Utilzation Ratio"
          value={new BigNumber(borrowUtilizationRatio).times(100).toFixed(0)}
          formatter={percentageFormatter}
        />
      </Cards>
      <Table data={supplyTable} />
      <Table data={borrowTable} />
      <Table data={allAssetsTable} />
    </Wrapper>
  );
}
// Cream.whyDidYouRender = true;
// export default Cream;
