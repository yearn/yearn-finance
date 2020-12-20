import React, { useEffect } from 'react';
import { selectContracts, selectAllContracts } from 'containers/App/selectors';
import { selectBorrowStats } from 'containers/Cream/selectors';
import styled from 'styled-components';
import { useInjectSaga } from 'utils/injectSaga';
import TokenIcon from 'components/TokenIcon';
import CreamTable from 'components/CreamTable';
import { getSupplyData, getBorrowData } from 'utils/cream';
import { useModal } from 'containers/ModalProvider/hooks';
import { useSelector, useDispatch } from 'react-redux';
import { initializeCream } from './actions';
import saga from './saga';

const Wrapper = styled.div`
  margin: 0 auto;
  max-width: 1200px;
  padding: 50px 40px;
`;

const TableTitle = styled.h1`
  margin-bottom: 10px;
  padding-top: 20px;
  font-size: 24px;
  text-transform: uppercase;
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

const tokenTransform = asset => {
  const { address, symbol } = asset;
  return (
    <IconAndName>
      <StyledTokenIcon address={asset.address} />
      <IconName>{symbol || address}</IconName>
    </IconAndName>
  );
};

const percentTransform = val => `${val}%`;

const tokenSymbolTransform = (val, row) => `${val} ${row.asset.symbol}`;

// const dollarTransform = val => `$${val}`;

const CollateralToggle = props => {
  const { enabled, rowData } = props;
  console.log('rowdata', rowData);
  if (enabled) {
    return 'yes';
  }
  return 'no';
};

const collateralTransform = (enabled, rowData) => (
  <CollateralToggle enabled={enabled} rowData={rowData} />
);

export default function Cream() {
  useInjectSaga({ key: 'cream', saga });
  const dispatch = useDispatch();

  const initialize = () => {
    dispatch(initializeCream());
  };
  useEffect(initialize, []);

  const creamCTokens = useSelector(selectContracts('creamCTokens'));
  const creamCTokenAddresses = _.map(creamCTokens, token => token.address);
  const allContracts = useSelector(selectAllContracts());
  const borrowLimitStats = useSelector(selectBorrowStats);
  const { openModal } = useModal();

  const allSupplyData = getSupplyData({
    creamCTokenAddresses,
    allContracts,
    borrowLimitStats,
  });

  const assetsSupplied = _.filter(allSupplyData, data => data.supplied > 0);
  const assetsSuppliable = _.filter(
    allSupplyData,
    data => parseInt(data.supplied, 10) === 0,
  );

  const allBorrowData = getBorrowData({
    creamCTokenAddresses,
    allContracts,
    borrowLimitStats,
  });

  const assetsBorrowed = _.filter(allBorrowData, data => data.borrowed > 0);
  const assetsBorrowable = _.filter(
    allBorrowData,
    data => parseInt(data.borrowed, 10) === 0,
  );

  const supplyRowClickHandler = row => {
    openModal('cream', row);
  };

  const boolTransform = val => (val ? 'yes' : 'no');

  const assetsSuppliedTable = {
    rowClickHandler: supplyRowClickHandler,
    columns: [
      { key: 'asset', transform: tokenTransform },
      {
        key: 'apy',
        transform: percentTransform,
      },
      {
        key: 'allowance',
        alias: 'Allowed',
        transform: boolTransform,
      },
      {
        key: 'supplied',
        alias: 'Supply',
        transform: tokenSymbolTransform,
      },
      { key: 'collateral', transform: collateralTransform },
    ],
    rows: assetsSupplied,
  };

  const assetsSuppliableTable = {
    rowClickHandler: supplyRowClickHandler,
    columns: [
      { key: 'asset', transform: tokenTransform },
      {
        key: 'apy',
        transform: percentTransform,
      },
      {
        key: 'allowance',
        transform: boolTransform,
      },
      {
        key: 'wallet',
        transform: tokenSymbolTransform,
      },
      { key: 'collateral', transform: collateralTransform },
    ],
    rows: assetsSuppliable,
  };

  const assetsBorrowableTableData = {
    columns: [
      { key: 'asset', transform: tokenTransform },
      {
        key: 'apy',
        transform: percentTransform,
      },
      {
        key: 'wallet',
        transform: tokenSymbolTransform,
      },
      { key: 'liquidity', transform: tokenSymbolTransform },
    ],
    rows: assetsBorrowable,
  };

  const assetsBorrowedTableData = {
    columns: [
      { key: 'asset', transform: tokenTransform },
      {
        key: 'apy',
        transform: percentTransform,
      },
      { key: 'borrowed', transform: tokenSymbolTransform },
      { key: 'liquidity', transform: tokenSymbolTransform },
    ],
    rows: assetsBorrowed,
  };

  return (
    <Wrapper>
      <TableTitle>Supplied</TableTitle>
      <CreamTable data={assetsSuppliedTable} />
      <TableTitle>Suppliable</TableTitle>
      <CreamTable data={assetsSuppliableTable} />
      <TableTitle>Borrowed</TableTitle>
      <CreamTable data={assetsBorrowedTableData} />
      <TableTitle>Borrowable</TableTitle>
      <CreamTable data={assetsBorrowableTableData} />
    </Wrapper>
  );
}
// Cream.whyDidYouRender = true;
// export default Cream;
