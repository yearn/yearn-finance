import React, { useEffect } from 'react';
import {
  selectContractsByTag,
  selectAllContracts,
} from 'containers/App/selectors';
import { selectBorrowStats } from 'containers/Cream/selectors';
import styled from 'styled-components';
import { useInjectSaga } from 'utils/injectSaga';
import TokenIcon from 'components/TokenIcon';
import Table from 'components/Table';
import { getSupplyData, getBorrowData } from 'utils/cream';
import { useModal } from 'containers/ModalProvider/hooks';
import IconButton from 'components/IconButton';
import { useSelector, useDispatch } from 'react-redux';
import InfoCard from 'components/InfoCard';
import { initializeCream } from './actions';
import saga from './saga';

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
  grid-template-columns: repeat(3,1fr);
  grid-column-gap: 16px;
  margin-bottom: 32px;
}
`;

const Buttons = styled.div`
  display: inline-flex;
  grid-gap: 12px;
`;

const tokenTransform = asset => {
  const { address, symbol } = asset;
  return (
    <IconAndName>
      <StyledTokenIcon address={asset.address} />
      <IconName>{symbol[0].value || address}</IconName>
    </IconAndName>
  );
};

const percentTransform = val => `${val}%`;

// const tokenSymbolTransform = (val, row) =>
//   `${val} ${row.asset.symbol[0].value}`;

// const dollarTransform = val => `$${val}`;

// const CollateralToggle = props => {
//   const { enabled } = props;
//   if (enabled) {
//     return 'yes';
//   }
//   return 'no';
// };

// const collateralTransform = (enabled, rowData) => (
//   <CollateralToggle enabled={enabled} rowData={rowData} />
// );

export default function Cream() {
  useInjectSaga({ key: 'cream', saga });
  const dispatch = useDispatch();

  const initialize = () => {
    dispatch(initializeCream());
  };
  useEffect(initialize, []);

  const creamCTokens = useSelector(selectContractsByTag('creamCTokens'));

  const creamCTokenAddresses = _.map(creamCTokens, token =>
    _.get(token, 'address'),
  );
  const allContracts = useSelector(selectAllContracts());
  const borrowLimitStats = useSelector(selectBorrowStats);
  const { openModal } = useModal();

  const supplyData = getSupplyData({
    creamCTokenAddresses,
    allContracts,
    borrowLimitStats,
  });

  const supplyDataSorted = _.orderBy(supplyData, 'supplied', 'desc');

  const borrowData = getBorrowData({
    creamCTokenAddresses,
    allContracts,
    borrowLimitStats,
  });

  const borrowDataSorted = _.orderBy(borrowData, 'borrowed', 'desc');
  const borrowedData = _.filter(borrowDataSorted, data => data.borrowed > 0);

  const suppliedData = _.filter(supplyDataSorted, data => data.supplied > 0);

  const supplyRowClickHandler = row => {
    openModal('cream', row);
  };

  // const boolTransform = val => (val ? 'yes' : 'no');

  const borrowActionsTransform = (val, row) => {
    let withdrawButton;
    if (row.borrowed > 0) {
      withdrawButton = <IconButton iconType="arrowUpAlt">Repay</IconButton>;
    }
    return (
      <Buttons>
        {withdrawButton}
        <IconButton iconType="arrowDownAlt">Borrow</IconButton>
      </Buttons>
    );
  };

  const allActionsTransform = () => (
    <Buttons>
      <IconButton iconType="arrowUpAlt">Supply</IconButton>
      <IconButton iconType="arrowDownAlt">Borrow</IconButton>
    </Buttons>
  );

  const supplyActionsTransform = (val, row) => {
    let withdrawButton;
    if (row.supplied > 0) {
      withdrawButton = (
        <IconButton iconType="arrowDownAlt">Withdraw</IconButton>
      );
    }
    return (
      <Buttons>
        {withdrawButton}
        <IconButton iconType="arrowUpAlt">Supply</IconButton>
      </Buttons>
    );
  };

  const supplyTable = {
    title: 'Assets Supplied - $8.00',
    rowClickHandler: supplyRowClickHandler,
    columns: [
      { key: 'asset', transform: tokenTransform },
      {
        key: 'supplied',
      },
      {
        key: 'wallet',
        alias: 'balance',
      },
      {
        key: 'apy',
        transform: percentTransform,
      },
      {
        key: 'actions',
        alias: '',
        transform: supplyActionsTransform,
      },
    ],
    rows: suppliedData,
  };

  const borrowTable = {
    title: 'Assets Borrowed - $2.00',
    columns: [
      { key: 'asset', transform: tokenTransform },
      {
        key: 'borrowed',
      },
      {
        key: 'wallet',
        alias: 'Balance',
      },
      {
        key: 'apy',
        transform: percentTransform,
      },
      {
        key: 'actions',
        alias: '',
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
        key: 'wallet',
        alias: 'Balance',
      },
      {
        key: 'supplyApy',
        transform: percentTransform,
      },
      {
        key: 'borrowApy',
        transform: percentTransform,
      },
      {
        key: 'actions',
        alias: '',
        transform: allActionsTransform,
      },
    ],
    rows: borrowDataSorted,
  };

  console.log('borw', borrowDataSorted);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

  const dollarFormatter = val => formatter.format(val);
  const percentageFormatter = val => `${parseInt(val, 10).toFixed(0)}%`;

  return (
    <Wrapper>
      <Cards>
        <InfoCard
          label="Supply Balance"
          value="3"
          formatter={dollarFormatter}
        />
        <InfoCard
          label="Borrow Balance"
          value="3"
          formatter={dollarFormatter}
        />
        <InfoCard
          label="BorrowUtilzation Ratio"
          value="3"
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
