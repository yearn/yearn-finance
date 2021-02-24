import React from 'react';
import ColumnList from 'components/Vault/columns';
import Text from 'components/Text';
import styled from 'styled-components';
import Tooltip from '@material-ui/core/Tooltip';

const backscratcherGridTemplate = '190px 155px 155px 140px 160px 140px 1fr';
const vaultsGridTemplate = '210px 110px 160px 140px 200px 1fr';

const Underlined = styled.span`
  border-bottom: 1px dotted white;
`;

const backscratcherColumns = [
  { name: 'Asset' },
  { name: 'Deposited' },
  { name: 'Multiplier' },
  { name: 'Growth' },
  { name: 'Total Assets' },
  { name: 'Available to deposit' },
];

const vaultColumns = [
  { name: 'Asset', sort: 'displayName' },
  {
    name: 'Version',
    sort: 'type',
    tooltip:
      'v1 vaults have one strategy and a withdrawal fee of 0.5%. v2 vaults have a maximum of 20 strategies and a management fee of 2%. Most vaults have a performance fee of 20% that is split between strategists and Yearn’s treasury. Furthermore, Curve vaults lock a percentage of each CRV harvest to boost future yields.',
  },
  { name: 'Deposited', sort: 'valueDeposited' },
  {
    name: 'Growth',
    sort: 'valueApy',
    tooltip:
      'Gross APY (Vault yield, annualized) is displayed below. Most vaults report annualized weekly yield, though a vault will default to monthly if weekly is less reliable. Net APY is shown on hover.',
  },
  { name: 'Total Assets', sort: 'valueTotalAssets' },
  { name: 'Available to deposit', sort: 'valueAvailableToDeposit' },
];

const StyledText = styled(Text)`
  cursor: ${(props) => (props.sortKey ? 'pointer' : 'default')};
`;

const StyledArrow = styled.div`
  margin-left: 0.8rem;
  display: inline-block;
  transform: ${(props) =>
    props.order === 'descending' ? 'rotate(0)' : 'rotate(-180deg)'};
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

export default function VaultsHeader({
  backscratcher,
  requestSort = null,
  sortConfig = null,
}) {
  const columns = backscratcher ? backscratcherColumns : vaultColumns;
  return (
    <ColumnList
      gridTemplate={
        backscratcher ? backscratcherGridTemplate : vaultsGridTemplate
      }
    >
      {columns.map((column) => {
        const sortKey = column.sort;
        const sortedColumn = sortConfig ? sortConfig.key === sortKey : false;
        const sortedDirection = sortedColumn ? sortConfig.direction : null;
        const columnClick = sortKey ? () => requestSort(sortKey) : () => {};
        const sortArrow = sortedColumn ? (
          <StyledArrow order={sortedDirection} />
        ) : null;

        return (
          <StyledText
            key={column.name}
            large
            mb={18}
            pt={20}
            sortKey={sortKey}
            onClick={columnClick}
          >
            {column.tooltip ? (
              <Tooltip title={column.tooltip} arrow>
                <Underlined>{column.name}</Underlined>
              </Tooltip>
            ) : (
              column.name
            )}
            {sortArrow}
          </StyledText>
        );
      })}
    </ColumnList>
  );
}
