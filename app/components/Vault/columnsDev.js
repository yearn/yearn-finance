import styled from 'styled-components';

export default styled.div`
  display: grid;
  grid-template-columns: 370px 140px 160px 140px 1fr;
  width: 100%;
  align-items: center;
  font-family: 'Roboto';
  font-weight: 900;
  font-size: 20px;
  > div {
    white-space: nowrap;
    text-overflow: ellipsis;
    &:not(:first-of-type) {
      margin-top: 8px;
    }
    &:first-of-type {
      margin-left: 15px;
    }
  }
`;
