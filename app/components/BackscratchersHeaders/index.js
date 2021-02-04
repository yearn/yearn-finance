import React from 'react';
import styled from 'styled-components';
import BackscratcherColumns from 'components/Vault/backscratcherColumns';

const ColumnHeader = styled.div`
  margin-bottom: 10px;
  padding-top: 20px;
  font-size: 17px;
  text-transform: uppercase;
`;

export default function BackscratcherHeaders() {
  return (
    <BackscratcherColumns>
      <ColumnHeader>Asset</ColumnHeader>
      <ColumnHeader>Deposited</ColumnHeader>
      <ColumnHeader>APY</ColumnHeader>
      <ColumnHeader>Total assets</ColumnHeader>
      <ColumnHeader>Available to deposit</ColumnHeader>
    </BackscratcherColumns>
  );
}
