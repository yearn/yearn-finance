import React from 'react';
import ColumnList from 'components/Vault/columns';
import Text from 'components/Text';
import styled from 'styled-components';

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
  'Deposited' : 'valueDeposited',
  'Growth' : 'valueApy',
  'Total Assets' : 'valueTotalAssets',
  'Available to deposit' : 'valueAvailableToDeposit'
};

const StyledText = styled(Text)`
  cursor: ${(props) => (props.sortKey ? 'pointer' : 'default')};
`;

const StyledArrow = styled.div`
  margin-left: 5px;
  display: inline-block;
  transform: ${(props) => props.order === 'descending' ? 'rotate(0)' : 'rotate(-180deg)'};
  transition: transform 0.05s linear;
  width: 7px;
  height: 7px;
  top: -2px;
  left: -4px;
  position: relative;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 7px solid #ffffff;
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
        const sortArrow = sortedColumn ? <StyledArrow order={sortedDirection} /> : null;

        return (
          <StyledText key={column} large mb={18} pt={20} sortKey={sortKey} onClick={columnClick}>
            {column} {sortArrow}
          </StyledText>
        );
      })}
    </ColumnList>
  );
}
