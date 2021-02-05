/* eslint-disable react/no-array-index-key */
import React from 'react';
import styled from 'styled-components';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

const StyledTableContainer = styled(TableContainer)`
  border: 4px solid;
  border-radius: 10px;
  border-color: #0657f9;
`;

const StyledCellHeader = styled(TableCell)`
  color: white !important;
  border-bottom: 0.1px solid #0657f9 !important;
`;

const StyledCell = styled(TableCell)`
  font-family: roboto;
  color: white !important;
  border: 0px !important;
`;

const CreamTable = ({ metadata, data }) => (
  <StyledTableContainer>
    <Table>
      <TableHead>
        <TableRow>
          {metadata.map(({ key, alias, align }) => (
            <StyledCellHeader key={key} align={align}>
              {alias}
            </StyledCellHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row, i) => (
          <TableRow key={`${i}`}>
            {metadata.map(({ key, transform, align }) => (
              <StyledCell
                component="th"
                scope="row"
                key={`${key}-${i}`}
                align={align}
              >
                {transform ? transform(row) : row[key]}
              </StyledCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </StyledTableContainer>
);

export default CreamTable;
