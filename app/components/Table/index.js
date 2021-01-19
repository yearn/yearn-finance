import React from 'react';
import styled from 'styled-components';
import TableContext from './context';

const Td = styled.td`
  padding: 16px 0px;
  &:last-of-type {
    text-align: right;
    padding-right: 16px;
    width: 0.1%;
  }
  border-top: 1px solid ${(props) => props.theme.tableBorder};
  &:first-of-type {
    padding-left: 16px;
  }
`;

const TableTitle = styled.h1`
  margin-bottom: 16px;
  font-weight: 400;
  padding-top: 20px;
  font-size: 20px;
`;

const StyledTable = styled.table`
  font-size: 18px;
  border-collapse: collapse;
  border-spacing: 0px;
  font-family: monospace;
  width: 100%;
  margin-bottom: 2rem;
  border: 1px solid ${(props) => props.theme.tableBorder};
  border-radius: 4px;
`;

const Th = styled.th`
  padding-top: 16px;
  padding-bottom: 16px;
  text-align: left;
  font-weight: 500;
  text-transform: capitalize;
  font-size: 16px;
  &:first-of-type {
    padding-left: 16px;
  }
  &:last-of-type {
    text-align: right;
    padding-right: 16px;
  }
`;

const Tr = styled.tr``;

const Thead = styled.thead`
  th {
  }
`;

export default function Table(props) {
  const { data, className, tableData } = props;
  const { columns, rows, rowClickHandler, title } = data;

  const renderHeader = (column, idx) => {
    const { alias, key } = column;
    const spacedKey = key.replace(/([A-Z])/g, ' $1');
    const spacedAndCapitalizedKey = _.upperFirst(spacedKey);
    const columnName = alias === '' ? '' : alias || spacedAndCapitalizedKey;
    const columnKey = `${columnName}${idx}`;
    return <Th key={columnKey}>{columnName}</Th>;
  };

  const renderHeaders = () => {
    const headerMap = _.map(columns, renderHeader);
    return <tr>{headerMap}</tr>;
  };

  const renderRows = () => _.map(rows, renderRow);

  const renderRow = (row, idx) => {
    const columnEls = renderColumns(row);
    const { id } = row;

    const key = `${idx}`;
    return (
      <Tr
        onClick={(evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          if (rowClickHandler) {
            // console.log('bois');
            rowClickHandler(row);
          }
        }}
        id={id}
        key={key}
      >
        {columnEls}
      </Tr>
    );
  };

  const renderColumns = (row) => {
    const renderColumnWithRowData = _.bind(renderColumn, null, row);
    const columnEls = _.map(columns, renderColumnWithRowData);
    return columnEls;
  };

  const renderColumn = (row, column, idx) => {
    const columnKey = column.key;
    let rowValue = _.get(row, columnKey, 'N/A');
    const columnData = columns[idx];
    const { transform } = columnData;
    if (transform) {
      rowValue = transform(rowValue, row);
    }
    return (
      <Td key={idx}>
        <React.Fragment>{rowValue}</React.Fragment>
      </Td>
    );
  };

  return (
    <TableContext.Provider value={{ tableData }}>
      <TableTitle>{title}</TableTitle>
      <StyledTable className={className}>
        <Thead>{renderHeaders()}</Thead>
        <tbody>{renderRows()}</tbody>
      </StyledTable>
    </TableContext.Provider>
  );
}
