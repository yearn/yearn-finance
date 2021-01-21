import styled from 'styled-components';

export default styled.div`
  display: grid;
  grid-template-columns: 210px 110px 160px 140px 200px 1fr;
  font-family: 'Roboto';
  font-weight: 900;
  font-size: 20px;

  width: 100%;
  align-items: center;
  > div {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    &:first-of-type {
      margin-left: 15px;
    }
  }
`;
