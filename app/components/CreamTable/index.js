import React from 'react';
import styled from 'styled-components';
import TableContext from './context';

const Td = styled.td`
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
`;

const Table = styled.table`
  font-size: 18px;
  padding-bottom: 20px;
  border-collapse: initial;
  font-family: monospace;
  width: 100%;
  margin-bottom: 2rem;
`;

const Th = styled.th`
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  font-size: 18px;
  text-transform: uppercase;
  text-align: left;
`;

export default function CreamTable(props) {
  const { data, className, tableData } = props;
  const { columns, rows, rowClickHandler } = data;

  const renderHeader = (column, idx) => {
    const { alias, key } = column;
    const spacedKey = key.replace(/([A-Z])/g, ' $1');
    const spacedAndCapitalizedKey = _.upperFirst(spacedKey);
    const columnName = alias || spacedAndCapitalizedKey;
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
      <tr
        onClick={evt => {
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
      </tr>
    );
  };

  const renderColumns = row => {
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
        <div>{rowValue}</div>
      </Td>
    );
  };

  return (
    <TableContext.Provider value={{ tableData }}>
      <Table className={className}>
        <thead>{renderHeaders()}</thead>
        <tbody>{renderRows()}</tbody>
      </Table>
    </TableContext.Provider>
  );
}
