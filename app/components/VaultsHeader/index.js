import React from 'react';
import ColumnList from 'components/Vault/columns';
import Text from 'components/Text';
import styled from 'styled-components';
import Arrow from 'images/arrow.svg';

const backscratcherGridTemplate = '190px 155px 155px 140px 160px 140px 1fr';
const vaultsGridTemplate = '210px 110px 160px 140px 200px 1fr';

const backscratcherColumns = [
  'Asset',
  'Deposited',
  'Multiplier',
  'Growth',
  'Total Assets',
  'Available to deposit',
];

const vaultColumns = [
  'Asset',
  'Version',
  'Deposited',
  'Growth',
  'Total Assets',
  'Available to deposit',
];

const sortColumnMap = {
  'Asset' : 'displayName',
  'Version' : 'type',
  'Deposited' : 'balanceOf',
  'Growth' : 'apyRecommended',
  'Total Assets' : 'balance',
  'Available to deposit' : 'tokenBalance'
};

const StyledText = styled(Text)`
  cursor: ${(props) => (props.sortKey ? 'pointer' : 'default')};
`;

const StyledArrow = styled.img`
  margin-left: 5px;
  display: inline-block;
  transform: ${(props) => props.order === 'ascending' ? 'rotate(0)' : 'rotate(-180deg)'};
  transition: transform 0.1s linear;
`;

export default function VaultsHeader({ backscratcher, requestSort = null, sortConfig = null }) {
  const columns = backscratcher ? backscratcherColumns : vaultColumns;
  return (
    <ColumnList
      gridTemplate={
        backscratcher ? backscratcherGridTemplate : vaultsGridTemplate
      }
    >
      {columns.map((column) => {

        const sortKey = _.get(sortColumnMap, column);
        const sortedColumn = sortConfig ? sortConfig.key === sortKey : false;
        const sortedDirection = sortedColumn ? sortConfig.direction : null;
        const columnClick = sortKey ? () => requestSort(sortKey) : () => {};
        const sortArrow = sortedColumn ? <StyledArrow src={Arrow} alt="arrow" order={sortedDirection} /> : null;

        return (
          <StyledText key={column} large mb={18} pt={20} sortKey={sortKey} onClick={columnClick}>
            {column} {sortArrow}
          </StyledText>
        )
      })}
    </ColumnList>
  );
}
