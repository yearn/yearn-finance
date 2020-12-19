import React, { useEffect } from 'react';
import { selectContracts, selectAllContracts } from 'containers/App/selectors';
import { selectBorrowStats } from 'containers/Cream/selectors';
import styled from 'styled-components';
import { useInjectSaga } from 'utils/injectSaga';
import TokenIcon from 'components/TokenIcon';
import CreamTable from 'components/CreamTable';
import { getSupplyTableData, getBorrowTableData } from 'utils/cream';
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

const tokenSymbolTransform = (val, row) => `${val} ${row.underlyingSymbol}`;

const dollarTransform = val => `$${val}`;

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

  const supplyTableRows = getSupplyTableData({
    creamCTokenAddresses,
    allContracts,
    borrowLimitStats,
  });

  const borrowTableRows = getBorrowTableData({
    creamCTokenAddresses,
    allContracts,
    borrowLimitStats,
  });

  const supplyRowClickHandler = row => {
    openModal('cream', row);
  };

  const supplyTableData = {
    rowClickHandler: supplyRowClickHandler,
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
      {
        key: 'supplied',
        transform: tokenSymbolTransform,
      },
      { key: 'collateral' },
      {
        key: 'borrowLimit',
        transform: dollarTransform,
      },
      { key: 'borrowLimitUsed', transform: percentTransform },
    ],
    rows: supplyTableRows,
  };

  const borrowTableData = {
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
      { key: 'borrowed', transform: tokenSymbolTransform },
      { key: 'liquidity', transform: tokenSymbolTransform },
      { key: 'borrowLimit', transform: dollarTransform },
      { key: 'borrowLimitUsed', transform: percentTransform },
    ],
    rows: borrowTableRows,
  };

  return (
    <Wrapper>
      <TableTitle>Supply Market</TableTitle>
      <CreamTable data={supplyTableData} />
      <TableTitle>Borrow Market</TableTitle>
      <CreamTable data={borrowTableData} />
    </Wrapper>
  );
}
// Cream.whyDidYouRender = true;
// export default Cream;
