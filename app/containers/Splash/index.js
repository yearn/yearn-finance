import React from 'react';
import styled from 'styled-components';
import Button from 'components/Button';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

const Wrapper = styled.div`
  background-color: ${props => props.theme.yearnBlue};
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

const Logo = styled.div`
  color: ${({ theme }) => theme.white};
  font-size: 44px;
  margin-bottom: 20px;
`;

export default function HomePage(props) {
  return (
    <Wrapper>
      <Logo>Yearn</Logo>
      <Link to="dashboard">
        <Button>
          <FormattedMessage id="splash.enterButton" />
        </Button>
      </Link>
    </Wrapper>
  );
}
