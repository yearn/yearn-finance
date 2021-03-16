import React from 'react';
import ColumnList from 'components/Vault/columns';
import Text from 'components/Text';
import styled from 'styled-components';
import Tooltip from '@material-ui/core/Tooltip';

const amplifyVaultsGridTemplate = '210px 110px 160px 140px 200px 1fr';
const vaultsGridTemplate = '210px 110px 160px 140px 200px 1fr';

const Underlined = styled.span`
  border-bottom: 1px dotted white;
`;

const amplifyVaultColumns = [
  { name: 'Asset' },
  { name: 'Version' },
  { name: 'Deposited' },
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
      'Vault fees are shown below. For more details about fees, refer to our docs.',
  },
  { name: 'Deposited', sort: 'valueDeposited' },
  {
    name: 'Growth',
    sort: 'valueApy',
    tooltip:
      'Net APY (annualized yield after fees) is displayed below. Most vaults report annualized weekly yield, though a vault will default to monthly if weekly is less reliable. Gross APY (total yield before fees) is shown on hover.',
  },
  {
    name: 'Total Assets',
    sort: 'valueTotalAssets',
    tooltip:
      'Total assets held in the vault and strategy. Total token holdings and deposit limits, if present, are shown on hover.',
  },
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
  amplifyVault,
  requestSort = null,
  sortConfig = null,
}) {
  const columns = amplifyVault ? amplifyVaultColumns : vaultColumns;
  return (
    <ColumnList
      gridTemplate={
        amplifyVault ? amplifyVaultsGridTemplate : vaultsGridTemplate
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
              <Tooltip title={column.tooltip} placement="top" arrow>
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
