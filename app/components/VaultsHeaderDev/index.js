import React from 'react';
import styled from 'styled-components';
import ColumnListDev from 'components/Vault/columnsDev';

const ColumnHeader = styled.div`
  margin-bottom: 10px;
  padding-top: 20px;
  font-size: 17px;
  text-transform: uppercase;
`;

export default function VaultsHeaderDev() {
  return (
    <ColumnListDev>
      <ColumnHeader>Asset</ColumnHeader>
      <ColumnHeader>Type</ColumnHeader>
      <ColumnHeader>Deposited</ColumnHeader>
      <ColumnHeader>Total Assets</ColumnHeader>
      <ColumnHeader>Available to deposit</ColumnHeader>
    </ColumnListDev>
  );
}
