import styled from 'styled-components';

export default styled.div`
  display: grid;
  grid-template-columns: 362px 120px 150px 210px 1fr;
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
