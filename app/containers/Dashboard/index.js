import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

const Wrapper = styled.div`
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export default function Dashboard() {
  return (
    <Wrapper>
      <Link to="vaults">
        <FormattedMessage id="dashboard.products" />
      </Link>
      <Link to="stats">
        <FormattedMessage id="dashboard.stats" />
      </Link>
    </Wrapper>
  );
}
