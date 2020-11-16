import styled from 'styled-components';

export default styled.div`
  display: grid;
  grid-template-columns: 270px 160px 140px 200px 1fr;
  width: 100%;
  align-items: center;
  > div {
    overflow: hidden;
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
