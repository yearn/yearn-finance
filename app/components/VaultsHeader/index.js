import React from 'react';
import ColumnList from 'components/Vault/columns';
import Text from 'components/Text';

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

export default function VaultsHeader({ backscratcher }) {
  const columns = backscratcher ? backscratcherColumns : vaultColumns;
  return (
    <ColumnList
      gridTemplate={
        backscratcher ? backscratcherGridTemplate : vaultsGridTemplate
      }
    >
      {columns.map((column) => (
        <Text key={column} large mb={18} pt={20}>
          {column}
        </Text>
      ))}
    </ColumnList>
  );
}
