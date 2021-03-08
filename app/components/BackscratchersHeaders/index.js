import React from 'react';
import styled from 'styled-components';
import AmplifyColumns from 'components/Vault/amplifyColumns';

const ColumnHeader = styled.div`
  margin-bottom: 10px;
  padding-top: 20px;
  font-size: 17px;
  text-transform: uppercase;
`;

export default function AmplifyHeaders() {
  return (
    <AmplifyColumns>
      <ColumnHeader>Asset</ColumnHeader>
      <ColumnHeader>Deposited</ColumnHeader>
      <ColumnHeader>Multiplier</ColumnHeader>
      <ColumnHeader>Growth</ColumnHeader>
      <ColumnHeader>Total assets</ColumnHeader>
      <ColumnHeader>Available to deposit</ColumnHeader>
    </AmplifyColumns>
  );
}
